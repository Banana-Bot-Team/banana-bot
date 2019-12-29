
export type searchResult = { data: any, input: string };
export type searchFunction = (args: Array<string>) => Promise<searchResult>;
