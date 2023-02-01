import type { VFC } from 'react';
import { useState, useEffect } from 'react';
type Props = { dist: 'takatsuki' | 'tonda' };
type State = { diagramArr: number[]; currentTime: string };
const distObj = {
  takatsuki: '高槻',
  tonda: '富田',
};
const tommorrowNow = new Date(new Date().getTime() + 1000 * 3600 * 24);
const tomorrow = new Date(
  tommorrowNow.getFullYear(),
  tommorrowNow.getMonth() - 1,
  tommorrowNow.getDay(),
  0,
  0
);

export const DiagramTable: VFC<Props> = ({ dist }) => {
  const [diagram, setDiagram] = useState<State>({
    diagramArr: [0, 1],
    currentTime: '0',
  });
  useEffect(() => {
    (async () => {
      const takatsukiResponse = await (
        await fetch(`/api/diagram?dest=${dist}`)
      ).json();
      setDiagram({ ...diagram, diagramArr: takatsukiResponse });
    })();
    setTimeout(() => {
      location.reload();
    }, tomorrow.getTime() - new Date().getTime());
    const timer = setInterval(() => {
      setDiagram({
        ...diagram,
        currentTime: `${new Date().getHours()}時${new Date().getMinutes()}分${new Date().getSeconds()}秒`,
      });
      1000;
    });
    return () => clearInterval(timer);
  }, []);
  return (
    <table border={1}>
      <tbody>
        <tr>
          <th colSpan={3}>{distObj[dist]}行き</th>
        </tr>
        <tr>
          <td>時刻</td>
          <td>残り</td>
        </tr>
        {filterDiagramArr({ state: diagram }).map((diagram) => {
          return (
            <>
              <tr>
                <td>{diagram.time}</td>
                <td>{`${Math.trunc(diagram.limit / 60)}分`}</td>
              </tr>
            </>
          );
        })}
      </tbody>
    </table>
  );
};

export const filterDiagramArr = ({ state }: { state: State }) => {
  const currentTime = new Date().getTime();
  console.log(state.diagramArr);
  const filteredDiagramArr = state.diagramArr
    .filter((diagram: number) => {
      return diagram >= currentTime + 120 * 1000;
    })
    .filter((_, i: number) => {
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
  diagramArr: number[];
}): string[] => {
  return diagramArr.map((diagram) => {
    const hour = new Date(diagram).getHours();
    const minute = String(new Date(diagram).getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  });
};

const limitMinute = ({ diagramArr }: { diagramArr: number[] }) => {
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
