import {GoogleSpreadsheetRow} from "google-spreadsheet";
import {alertErr, axiosInstance, getFixedDateType} from "../helper";
import format from "date-fns-tz/format";
import parse from "date-fns/parse";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import {AxiosResponse} from "axios";
import {logger} from "../config/winston";

let convertedTodayInKr: string,
  todayInKrToDate: Date;

const tz: string = process.env.TIME_ZONE;

export const setConvertedTodayInKrToStr = (todayInKr: string) => convertedTodayInKr = todayInKr;
export const setTodayInKrToDate = (todayInKr: Date) => todayInKrToDate = todayInKr;
export const getTodayInKrToDate = (): Date => todayInKrToDate;
export const getConvertedTodayInKrToStr = (): string => convertedTodayInKr;

export const getTodayJoinDayUserArr = (rows: GoogleSpreadsheetRow[]): GoogleSpreadsheetRow[] => {
  return rows.filter((row): boolean => {
    const joinday: string = row['first day of work'];
    if(!joinday) {
      return false;
    }
    const name: string = row.name;
    const fixedDateType: string | null = getFixedDateType(joinday, name, 'joinday');
    if(!fixedDateType) {
      return false;
    }
    const convertedJoinDayInKr: string = format(parse(joinday, fixedDateType, todayInKrToDate), 'MM/dd', {timeZone: tz});
    return convertedTodayInKr === convertedJoinDayInKr;
  });
};
export const getTodayJoinDayDiffArr = (todayJoinDayUserArr: GoogleSpreadsheetRow[]): (number | null)[] => {
  return todayJoinDayUserArr.map((row): number | null => {
    const joinday: string = row['first day of work'];
    if(!joinday) {
      return null;
    }
    const name: string = row.name;
    const fixedDateType: string | null = getFixedDateType(joinday, name, joinday);
    if(!fixedDateType) {
      return null;
    }
    const convertedJoinDayInKr: string = format(parse(joinday, fixedDateType, todayInKrToDate), 'yyyy/MM/dd', {timeZone: tz});
    return differenceInCalendarYears(todayInKrToDate, utcToZonedTime(new Date(convertedJoinDayInKr), tz));
  });
};

export const getTodayBirthDayUserArr = (rows: GoogleSpreadsheetRow[]): GoogleSpreadsheetRow[] => {
  return rows.filter((row: GoogleSpreadsheetRow): boolean => {
    const {birthday, name} = row;
    const fixedDateType: string | null = getFixedDateType (birthday, name, 'birthday');
    if(!fixedDateType) {
      return false;
    }
    const convertedBirthDayInKr: string = format(parse(birthday, fixedDateType, todayInKrToDate), 'MM/dd', {timeZone: tz});
    return convertedTodayInKr === convertedBirthDayInKr;
  });
};
export const getUserIdArr = async (userArr: GoogleSpreadsheetRow[], slackToken: string): Promise<string[]> => {
  if(!slackToken) {
    throw new Error('Not Found Slack Token');
  }
  const slackApiBaseUrl: string = process.env.SLACK_API_BASE_URL;
  const reqUrl = `${slackApiBaseUrl}/users.lookupByEmail`;
  try {
    let userIdArr: string[] = [];

    for(let row of userArr){
      const params = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {
          token: slackToken,
          email: row.email
        }
      };
      const res: AxiosResponse = await axiosInstance.get(
        reqUrl,
        params
      );
      logger.info(`SUCCESS_API::${reqUrl}::${JSON.stringify(params.params)}`);
      logger.info(`SUCCESS_API_RESPONSE::${JSON.stringify(res?.data?.user)}`);
      if(res?.data?.user?.id) {
        userIdArr.push(res?.data?.user?.id);
      }
    }

    return userIdArr;

  } catch(e) {
    logger.error(`ERROR_REQUEST::${reqUrl}::${alertErr(e)}`);
    return [];
  }
};