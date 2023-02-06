import { type } from 'node:os';
import { useEffect, useState } from 'react';
import type { ReturnObject } from '@/pages/api/trafficinfo';
import type { FC } from 'react';

export const Trafficinfo: FC = () => {
  const [trafficinfo, setInfo] = useState<ReturnObject>({
    kyoto: 'normal',
    osakaloop: 'normal',
    gakkentoshi: 'normal',
  });
  useEffect(() => {
    const fetchapi = async () => {
      const responseTrafficInfo = await (
        await fetch(`/api/trafficinfo`)
      ).json();
      setInfo(responseTrafficInfo);
    };

    fetchapi();
    const interval = setInterval(fetchapi, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const resolveLineName = {
    kyoto: '京都線',
    osakaloop: '大阪環状線',
    gakkentoshi: '学研都市線',
  };

  return (
    <>
      {(Object.keys(trafficinfo) as (keyof ReturnObject)[]).map((lineName) => {
        return (
          <div key={lineName}>
            <span>{resolveLineName[lineName]}</span>
            <span>{trafficinfo[lineName]}</span>
          </div>
        );
      })}
    </>
  );
};
