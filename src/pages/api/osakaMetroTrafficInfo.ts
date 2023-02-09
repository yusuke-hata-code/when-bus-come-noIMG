import { parseHTML } from 'linkedom';

export type Status = 'delay' | 'normal' | 'stop';

type TableInfoList = [string, Status][];

const isStatus = (value: unknown): value is Status => {
  const statusArr = ['delay', 'normal', 'stop'];

  return statusArr.some((status) => {
    return status === value;
  });
};

const doFetch = async (): Promise<Document> => {
  return fetch('https://subway.osakametro.co.jp/guide/subway_information.php')
    .then(async (res) => {
      const { document } = parseHTML(await res.text());

      return document;
    })
    .catch(() => {
      return doFetch();
    });
};

const getTabelInfoList = (document: Document): TableInfoList => {
  return [...document.querySelectorAll('table.infoList tr')]
    .slice(1)
    .map<[string, Status]>((tr) => {
      const status = (
        tr.querySelector('img.cs-statusIcon_s') as HTMLImageElement
      ).src
        .split('_')
        .at(-2);

      if (isStatus(status)) {
        return [
          (tr.querySelector('td.cs-tdLine') as HTMLTableDataCellElement)
            .innerText as string,
          status,
        ];
      } else {
        throw new Error(`status not found : ${status}`);
      }
    });
};

export const config = {
  runtime: 'edge',
};

const handler = async () => {
  return new Response(JSON.stringify(getTabelInfoList(await doFetch())), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export default handler;
