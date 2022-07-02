export const reductId = (x: string | undefined) =>
  x?.match(/^.{6}|.{4}$/g)?.join('...');

export const setClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const getQueryObject = () => {
  return JSON.parse(JSON.stringify(Object.fromEntries(
    new URLSearchParams(location.search)
  ))) as any as BotQuery;
};

export type BotQuery = {
  action?:
    | 'createPaymentChannel'
    | 'walletCreated'
    | 'topUpAndInitPaymentChannel';
  initialBalanceA?: string;
  initialBalanceB?: string;
  addressA?: string;
  addressB?: string;
  channelId?: number;
  isA?: boolean;
  hisPublicKey?: any;
};
