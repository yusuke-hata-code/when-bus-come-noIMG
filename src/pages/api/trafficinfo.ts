import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

type Stops = {
  lines: Lines;
  express: any;
};

type Lines = {
  [key: string]: LineInfo;
};

type LineInfo = {
  count: number;
  section: Section;
  status: string;
  mark: number;
  cause: string;
  transfer: boolean;
  url: string;
};

type Section = {
  from: string;
  to: string;
};

type ResponseJson =
  | { type: 'station'; value: Stations }
  | { type: 'traffic'; value: Stops };

type Stations = { stations: Station[] };

type Station = { info: Info; design: Design };

type Design = {
  mark: string | null;
  upside: Side[] | null;
  downside: Side[] | null;
};

type Side = {
  type: number;
  side: number | null;
  linkLine: string | null;
  linkStationCode: string | null;
  line: string;
  linkDirection: null;
};

type Info = {
  name: string;
  code: string;
  stopTrains: number[] | null;
  typeNotice: string | null;
  transfer: Transfer[] | null;
  line: string | null;
  pairDisplay: null;
  lines: null;
};

type Transfer = {
  name: string;
  type: number;
  code: string;
  link: string | null;
  linkCode: string | null;
};

type status = 'delay' | 'normal' | 'stop';

export type ReturnObject = {
  kyoto: status;
  osakaloop: status;
  gakkentoshi: status;
};

const doFetch = async ({
  type,
  url,
}: {
  type: ResponseJson['type'];
  url: string;
}): Promise<ResponseJson> => {
  return fetch(url)
    .then(async (res) => {
      return { type, value: await res.json() } as ResponseJson;
    })
    .catch(() => {
      return doFetch({ url, type });
    });
};

const SearchTrafficInfo = async (): Promise<ReturnObject> => {
  const [trafficjson, stationjson] = await Promise.all([
    doFetch({
      type: 'traffic',
      url: 'https://www.train-guide.westjr.co.jp/api/v3/area_kinki_trafficinfo.json',
    }),
    doFetch({
      type: 'station',
      url: 'https://www.train-guide.westjr.co.jp/api/v3/kyoto_st.json',
    }),
  ]);
  const stationList: string[] = [];
  const returnObject: ReturnObject = {
    kyoto: 'normal',
    osakaloop: 'normal',
    gakkentoshi: 'normal',
  };

  if (stationjson.type === 'station') {
    for (const st of stationjson.value.stations) {
      stationList.push(st.info.name);
    }
  }

  if (trafficjson.type === 'traffic') {
    const lineList = ['osakaloop', 'gakkentoshi'] as const;

    for (const line of lineList) {
      if (trafficjson.value.lines[line]) {
        if (trafficjson.value.lines[line].status.includes('遅')) {
          returnObject[line] = 'delay';
        } else {
          returnObject[line] = 'stop';
        }
      }
    }

    if (trafficjson.value.lines['kyoto']) {
      const { from, to } = trafficjson.value.lines['kyoto'].section;

      if (
        stationList.indexOf(from) <= stationList.indexOf('摂津富田') &&
        stationList.indexOf(to) >= stationList.indexOf('高槻') &&
        trafficjson.value.lines['kyoto'].status.includes('遅')
      ) {
        returnObject.kyoto = 'delay';
      } else {
        returnObject.kyoto = 'stop';
      }
    }
  }

  return returnObject;

  // }
  // for (const line of keys) {
  //   console.log(trafficInfoJson.lines[line]);
  //   lines.push(trafficInfoJson.lines[line]);
  // }
};

const handler = async (req: NextRequest) => {
  return new Response(JSON.stringify([await SearchTrafficInfo()]), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  // return new.status(200).json(await SearchTrafficInfo());
};

export default handler;

SearchTrafficInfo();
