// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Temporal } from '@js-temporal/polyfill';
import { parseHTML } from 'linkedom';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};
// /api/diagram?dest=tonda
// /api/diagram?dest=takatsuki

type Diagram = number[];

const getUrl = (type: string | 'takatsuki' | 'tonda'): string | null => {
  const baseUrl =
    'https://transfer.navitime.biz/takatsuki/smart/diagram/Search/bus';
  const datetime = `${Temporal.Now.plainDateISO().toString()}T07:00+09:00`;
  const paramObj = {
    takatsuki: {
      datetime,
      startId: '00150093',
      stopNo: '1',
      course: '0003700096',
    },
    tonda: {
      datetime,
      startId: '00150093',
      stopNo: '8',
      course: '0003700142',
    },
  } as const;

  if (type === 'takatsuki' || type === 'tonda') {
    return `${baseUrl}?${new URLSearchParams(paramObj[type]).toString()}`;
  }

  return null;
};

const getDiagram = async (url: string): Promise<Diagram> => {
  const text = await (await fetch(url)).text();

  const dateString = Temporal.Now.plainDateISO().toString();
  const { document } = parseHTML(text);
  console.log(
    [
      ...document.querySelectorAll('div[style="display:block"] .hour-frame'),
    ].flatMap((e) => {
      const hour = `0${e.getAttribute('value')}`.slice(-2);

      return [...e.querySelectorAll('.minute>span[aria-hidden="true"]')].map(
        (e) =>
          new Date(`${dateString}T${hour}:${e.textContent}+09:00`).getTime()
      );
    })
  );

  return [
    ...document.querySelectorAll('div[style="display:block"] .hour-frame'),
  ].flatMap((e) => {
    const hour = `0${e.getAttribute('value')}`.slice(-2);

    return [...e.querySelectorAll('.minute>span[aria-hidden="true"]')].map(
      (e) => new Date(`${dateString}T${hour}:${e.textContent}+09:00`).getTime()
    );
  });
};

const handler = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get('dest');

  if (typeof dest === 'string') {
    const url = getUrl(dest);

    if (url) {
      try {
        const diagram = await getDiagram(url);

        return new Response(JSON.stringify(diagram), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify(err), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify([]), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  });
};

export default handler;
