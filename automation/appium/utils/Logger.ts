export class Logger {
  public static info(message: string, ...optionalParams: any[]) {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...optionalParams);
  }

  public static warn(message: string, ...optionalParams: any[]) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...optionalParams);
  }

  public static error(message: string, ...optionalParams: any[]) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...optionalParams);
  }

  public static debug(message: string, ...optionalParams: any[]) {
    console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, ...optionalParams);
  }
}
