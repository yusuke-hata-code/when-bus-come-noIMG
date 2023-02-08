// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Temporal } from '@js-temporal/polyfill';
import { JSDOM } from 'jsdom';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'edge',
};
// /api/diagram?dest=tonda
// /api/diagram?dest=takatsuki

type Diagram = number[];

const getUrl = (type: string | 'takatsuki' | 'tonda'): string | null => {
  const baseUrl =
    'https://transfer.navitime.biz/takatsuki/smart/diagram/Search/bus';
  const datetime = `${Temporal.Now.plainDateISO().toString()}T03:00+09:00`;
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
  const document = new JSDOM(text).window.document;

  return [
    ...document.querySelectorAll('div[style="display:block"] .hour-frame'),
  ].flatMap((e) => {
    const hour = `0${e.getAttribute('value')}`.slice(-2);

    return [...e.querySelectorAll('.minute>span[aria-hidden="true"]')].map(
      (e) => new Date(`${dateString}T${hour}:${e.textContent}+09:00`).getTime()
    );
  });
};

const handler = (req: NextApiRequest, res: NextApiResponse<Diagram>) => {
  if (typeof req.query.dest === 'string') {
    const url = getUrl(req.query.dest);
    console.log(url);

    if (url) {
      return getDiagram(url)
        .then((diagram) => {
          console.log(diagram);
          res.status(200).json(diagram);
        })
        .catch(() => res.status(404).json([]));
    }
  }

  return res.status(404).json([]);
};

export default handler;
