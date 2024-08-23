import { useEffect, useState } from 'react';
import style from './traininfo.module.css';
import type { Status } from '@/pages/api/osakaMetroTrafficInfo';
import type { ReturnObject } from '@/pages/api/trafficInfo';
import type { FC } from 'react';

type TableInfoListMap = Map<string, Status>;

export const Trafficinfo: FC = () => {
  const [jrTrafficinfo, setJrInfo] = useState<ReturnObject>({
    kyoto: 'normal',
    osakaloop: 'normal',
    gakkentoshi: 'normal',
  });
  useEffect(() => {
    const fetchapi = async () => {
      const responseTrafficInfo = await (
        await fetch(`/api/trafficInfo`)
      ).json();
      setJrInfo(responseTrafficInfo);
    };

    fetchapi();
    const interval = setInterval(fetchapi, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [osakaMetroTrafficinfo, setMetroInfo] = useState<TableInfoListMap>();
  useEffect(() => {
    const fetchapi = async () => {
      const responseTrafficInfo = await fetch(
        `/api/osakaMetroTrafficInfo`
      ).then(async (res) => await res.json());
      const statusMap = new Map(
        responseTrafficInfo.map((obj) => {
          const [key, value] = Object.entries(obj)[0];
          return [key, value];
        })
      ) as TableInfoListMap;
      setMetroInfo(statusMap);
    };

    fetchapi();
    const intervalMetro = setInterval(fetchapi, 600_000);

    return () => {
      clearInterval(intervalMetro);
    };
  }, []);

  const resolveJrLineName = {
    kyoto: { name: '京都線', symbol: 'A', color: 'rgb(16, 113, 182)' },
    osakaloop: { name: '大阪環状線', symbol: 'O', color: 'rgb(245, 70, 94)' },
    gakkentoshi: {
      name: '学研都市線',
      symbol: 'H',
      color: 'rgb(223, 95, 130)',
    },
  };
  const metroLineLists = ['御堂筋線', '中央線', '谷町線'] as const;
  const resoleveLineColor = {
    御堂筋線: { symbol: 'M', color: 'red' },
    中央線: { symbol: 'C', color: 'green' },
    ニュートラム: { symbol: 'P', color: 'blue' },
    谷町線: { symbol: 'T', color: 'purple' },
  };

  return (
    <>
      <div className={style.trafficInfo}>
        <div>
          {(Object.keys(jrTrafficinfo) as (keyof ReturnObject)[]).map(
            (lineName) => {
              return (
                <div key={lineName} className={style.lineInfo}>
                  <span
                    className={style.symbol}
                    style={{
                      backgroundColor: resolveJrLineName[lineName].color,
                    }}
                  >
                    {resolveJrLineName[lineName].symbol}
                  </span>
                  <span className={style.line}>
                    {resolveJrLineName[lineName].name}
                  </span>
                  {/* <span>{trafficinfo[lineName]}</span> */}

                  {jrTrafficinfo[lineName] === 'normal' ? (
                    <a href="https://trafficinfo.westjr.co.jp/kinki.html">
                      <img
                        src="ico_side_normal.svg"
                        width="60"
                        height="60"
                      ></img>
                    </a>
                  ) : jrTrafficinfo[lineName] === 'delay' ? (
                    <a href="https://trafficinfo.westjr.co.jp/kinki.html">
                      <img
                        src="ico_side_delay.svg"
                        width="60"
                        height="60"
                      ></img>
                    </a>
                  ) : (
                    <a href="https://trafficinfo.westjr.co.jp/kinki.html">
                      <img
                        src="ico_side_adjust.svg"
                        width="60"
                        height="60"
                      ></img>
                    </a>
                  )}
                </div>
              );
            }
          )}
        </div>
        <div>
          {metroLineLists.map((lineName) => {
            return (
              <div key={lineName} className={style.lineInfo}>
                <span
                  className={`${style.symbol} ${style.symbolcircle}`}
                  style={{ backgroundColor: resoleveLineColor[lineName].color }}
                >
                  {resoleveLineColor[lineName].symbol}
                </span>
                <span className={style.line}>{lineName}</span>
                {osakaMetroTrafficinfo?.get(lineName) === 'normal' ? (
                  <a href="https://subway.osakametro.co.jp/guide/subway_information.php">
                    <img src="ico_side_normal.svg" width="60" height="60"></img>
                  </a>
                ) : osakaMetroTrafficinfo?.get(lineName) === 'delay' ? (
                  <a href="https://subway.osakametro.co.jp/guide/subway_information.php">
                    <img src="ico_side_delay.svg" width="60" height="60"></img>
                  </a>
                ) : (
                  <a href="https://subway.osakametro.co.jp/guide/subway_information.php">
                    <img src="ico_side_adjust.svg" width="60" height="60"></img>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
