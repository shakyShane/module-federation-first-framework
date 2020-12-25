export enum ResultKind {
    Unknown = "Unknown",
    Response = "Response",
    Error = "Error",
    ModuleError = "ModuleError",
    Redirect = "Redirect",
}

export type Result =
    | {
          kind: ResultKind.Unknown;
      }
    | {
          kind: ResultKind.Response;
          status: number;
          html: string;
      }
    | {
          kind: ResultKind.Error;
          status: number;
          html: string;
          error: Error;
      }
    | {
          kind: ResultKind.ModuleError;
          error: Error;
      }
    | {
          kind: ResultKind.Redirect;
          status: number;
          location: string;
      };
