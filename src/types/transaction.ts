export type TxType = "deposit" | "gameCost" | "gameWin" | "redeemCash" | "redeemGift";

export interface Transaction {
  id: string;             // uuid
  date: string;           // ISO
  type: TxType;
  amount: number;         // + / – in coins or NOK
  note?: string;          // "Lucky Spin gevinst", "Amazon-kort"
}
