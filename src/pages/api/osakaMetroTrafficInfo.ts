export const handler = async () => {};

const selectLine = ['御堂筋線', '中央線'];

const doFetch = async (): Promise<JSON> => {
  return fetch('https://subway.osakametro.co.jp/guide/subway_information.php')
    .then(async (res) => {
      console.log(await res.json());

      return (await res.json()) as JSON;
    })
    .catch(() => {
      return doFetch();
    });
};

doFetch();
