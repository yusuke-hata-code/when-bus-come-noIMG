import { parseHTML } from 'linkedom';

export type Status = 'delay' | 'normal' | 'stop';

type TableInfoList = [string, Status][];

const doFetch = async () => {
  const response = await fetch('http://localhost:5000').then(
    async (res) => await res.json()
  );
  return response;
};

export const config = {
  runtime: 'edge',
};

const handler = async () => {
  return new Response(JSON.stringify(await doFetch()), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export default handler;
