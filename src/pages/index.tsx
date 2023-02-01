import Head from 'next/head';
import React, { useState, useEffect } from 'react';
let sampleDiagram: number[] = [
  1675200900000, 1675202460000, 1675205040000, 1675206600000, 1675210680000,
  1675212300000, 1675215600000, 1675216980000, 1675219200000, 1675222740000,
  1675224420000, 1675226580000, 1675230060000, 1675232400000, 1675236660000,
  1675237740000, 1675240680000, 1675242060000, 1675242600000, 1675247760000,
  1675250160000, 1675254600000, 1675258260000,
].sort();

let sampleRenderingDiagram = [
  {
    time: '19:36',
    limit: 14,
  },
];

//10:10,10:30,10:45,11:30,12:00
export default function Home() {
  const [diagram, setDiagram] = useState<diagramObj[]>(sampleRenderingDiagram);
  useEffect(() => {
    const timer = setInterval(() => {
      setDiagram(filterDiagramArr({ diagramArr: sampleDiagram })), 1000;
    });
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <Head>
        <title>when-bus-come</title>
      </Head>
      <div>
        <table border={1}>
          <tbody>
            <tr>
              <th colSpan={3}>高槻行き</th>
            </tr>
            <tr>
              <td>時刻</td>
              <td>残り</td>
            </tr>
            {diagram.map((diagram) => {
              return (
                <>
                  <tr>
                    <td>{diagram.time}</td>
                    <td>{`${Math.trunc(diagram.limit / 60)}分${
                      diagram.limit % 60
                    }秒`}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>

        <table border={1}>
          <tbody>
            <tr>
              <th colSpan={3}>富田行き</th>
            </tr>
            <tr>
              <td>時刻</td>
              <td>残り</td>
            </tr>
            {diagram.map((diagram) => {
              return (
                <>
                  <tr>
                    <td>{diagram.time}</td>
                    <td>{`${Math.trunc(diagram.limit / 60)}分${
                      diagram.limit % 60
                    }秒`}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
type diagramObj = {
  time: string;
  limit: number;
};

type DiagramArr = number[];

const filterDiagramArr = ({ diagramArr }: { diagramArr: DiagramArr }) => {
  const currentTime = new Date().getTime();
  const filteredDiagramArr = diagramArr
    .filter((diagram) => {
      return diagram >= currentTime + 120 * 1000;
    })
    .filter((_, i) => {
      console.log(_);
      return i < 3;
    });

  const limitTimeTable = limitMinute({ diagramArr: filteredDiagramArr });
  const timeTable = unixTimeToViewTime({ diagramArr: filteredDiagramArr });
  return timeTable.map((time, i) => {
    return { time: time, limit: limitTimeTable[i] };
  });
};

const unixTimeToViewTime = ({
  diagramArr,
}: {
  diagramArr: DiagramArr;
}): string[] => {
  return diagramArr.map((diagram) => {
    const hour = new Date(diagram).getHours();
    const minute = String(new Date(diagram).getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  });
};

const limitMinute = ({ diagramArr }: { diagramArr: DiagramArr }) => {
  const currentMinutes =
    new Date().getHours() * 3600 +
    new Date().getMinutes() * 60 +
    new Date().getSeconds();
  return diagramArr.map((diagram: number) => {
    const diagramMinutes =
      new Date(diagram).getHours() * 3600 +
      new Date(diagram).getMinutes() * 60 +
      new Date(diagram).getSeconds();
    return diagramMinutes - currentMinutes;
  });
};
