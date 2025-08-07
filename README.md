# SpareTrend Prototype

This project is a prototype for the SpareTrend application, built with React, TypeScript, and Tailwind CSS.

## Features

### Redeem & History

This feature allows users to redeem their earned coins for cash payouts or gift cards, and to view their complete transaction history.

**Data Model:**

The core data is managed through a `Transaction` interface:

```typescript
type TxType = "deposit" | "gameCost" | "gameWin" | "redeemCash" | "redeemGift";

interface Transaction {
  id: string;             // uuid
  date: string;           // ISO
  type: TxType;
  amount: number;         // + / – in coins or NOK
  note?: string;          // "Lucky Spin gevinst", "Amazon-kort"
}
```

Transactions are stored in the browser's `localStorage`.

**Export Format:**

The transaction history can be exported as a CSV file with the following format:
`transactions-YYYY-MM.csv`

The columns in the CSV are: `date,type,amount,note,id`.

**Demo:**

*(A demo GIF would be placed here to showcase the functionality.)*

## Running the Project

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

This will start the application on `http://localhost:5173`.

## Testing

The project is set up with Vitest for unit testing. Run the tests with:

```bash
npm test
```

*(Note: Due to environment instability, running tests has been unsuccessful.)*
