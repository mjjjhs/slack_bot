import express, {NextFunction, Request, Response} from "express";
import createHttpError from 'http-errors';
import helmet from 'helmet';
import {GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet} from 'google-spreadsheet';
import compression from 'compression';
import {
  alertErr,
} from "./helper";
import { logger } from './config/winston';
import format from 'date-fns-tz/format';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import cron from 'node-cron';
import path from 'path';
import dotenv from 'dotenv';
import {sendMessage} from "./modules/sendMessage";
import {
  getTodayBirthDayUserArr, getTodayInKrToDate,
  getTodayJoinDayDiffArr,
  getTodayJoinDayUserArr,
  getUserIdArr, setConvertedTodayInKrToStr, setTodayInKrToDate
} from "./modules/filterSendUser";

let credentials: any,
  envPath: string;

process.env.NODE_ENV === 'dev' ? credentials = require('../credentials') : credentials = require('../../credentials');
process.env.NODE_ENV === 'dev' ? envPath = '../.env.dev' : envPath = '../../.env.dev';
dotenv.config({path: path.join(__dirname, envPath)});

if(!dotenv.config({path: path.join(__dirname, envPath)})) {
  throw new Error('Not Found ENV!');
}

const app: express.Application = express();

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res, next) => {
  return res.sendStatus(200);
});

logger.info(`APP START!!`);

const tz: string = process.env.TIME_ZONE;
const sheetId: string = process.env.SHEET_ID;
const docId: string = process.env.DOC_ID;

let curSheet: GoogleSpreadsheetWorksheet,
  rows: GoogleSpreadsheetRow[];


async function getDocument(): Promise<GoogleSpreadsheetWorksheet> {
  const doc = new GoogleSpreadsheet(docId);
  await doc.useServiceAccountAuth(credentials);

  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsById[parseInt(sheetId, 10)];

  return sheet;
}

const sendBirthdayUser = async (): Promise<void> => {
  const todayBirthDayUserArr: GoogleSpreadsheetRow[] = getTodayBirthDayUserArr(rows);

  let userIdArr: string[] = await getUserIdArr(todayBirthDayUserArr, credentials.slackToken);

  if(userIdArr.length) {
    sendMessage(userIdArr, 'birthday');
  }
};

const sendJoinUser = async (): Promise<void> => {
  const todayJoinDayUserArr: GoogleSpreadsheetRow[] = getTodayJoinDayUserArr(rows);

  const todayJoinDayDiffArr: (number | null)[] = getTodayJoinDayDiffArr(todayJoinDayUserArr);
  let userIdArr: string[] = await getUserIdArr(todayJoinDayUserArr, credentials.slackToken);

  if(userIdArr.length) {
    sendMessage(userIdArr, 'joinday', {todayJoinDayDiffArr});
  }
};

async function start(): Promise<void> {
  try {
    logger.info(`BATCH START!!`);

    curSheet = await getDocument();

    // Sheet 생성
    // const sheet = await doc.addSheet({ headerValues: ['name', 'email', 'birthday', 'first day of work'], title: 'LQT Member' });

    // Sheed 수정
    // await sheet.setHeaderRow(['name', 'email', 'birthday', 'first day of work']);

    // Row 생성
    // await sheet.addRow({ name: '문지훈', email: 'jihoon.moon@yanolja.com', birthday: '1984.05.09', 'first day of work': '2020.03.30'});

    rows = await curSheet.getRows();

    setTodayInKrToDate(utcToZonedTime(new Date(), tz));
    setConvertedTodayInKrToStr(format(getTodayInKrToDate(), 'MM/dd', {timeZone: tz})) ;

    sendBirthdayUser();

    sendJoinUser();

  } catch (e) {
    logger.error(`ERROR_START::${alertErr(e)}`);
  }
}
cron.schedule('0 9 * * *', () => { //시간변경
  start();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createHttpError(404));
});

// error handler
app.use(function(err: any, req: Request<any>, res: Response<any>, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

export default app;
