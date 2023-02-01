import Head from 'next/head';

import { DiagramTable, filterDiagramArr } from '@/components/diagramTable';
// let sampleDiagram: number[] = [
//   1675200900000, 1675202460000, 1675205040000, 1675206600000, 1675210680000,
//   1675212300000, 1675215600000, 1675216980000, 1675219200000, 1675222740000,
//   1675224420000, 1675226580000, 1675230060000, 1675232400000, 1675236660000,
//   1675237740000, 1675240680000, 1675242060000, 1675242600000, 1675247760000,
//   1675250160000, 1675254600000, 1675258260000,
// ].sort();

// let sampleRenderingDiagram = [
//   {
//     time: '19:36',
//     limit: 14,
//   },
// ];

//10:10,10:30,10:45,11:30,12:00
export default function Home() {
  return (
    <>
      <Head>
        <title>when-bus-come</title>
      </Head>
      <div>
        <div>
          現在時刻
          {`${new Date().getHours()}時${new Date().getMinutes()}分${new Date().getSeconds()}秒`}
        </div>
        <DiagramTable dist="takatsuki" />

        <DiagramTable dist="tonda" />
      </div>
    </>
  );
}
