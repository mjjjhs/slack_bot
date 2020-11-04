import {alertErr, axiosInstance, getPayload} from "../helper";
import {logger} from "../config/winston";

export const sendMessage = (userIdArr: string[], type: string = 'birthday', params: null | any = null): void => {
  const webHookApiUrl: string = process.env.WEBHOOK_API_URL;
  if(!userIdArr.length) {
    return;
  }

  const userIdArrLength = userIdArr.length - 1;

  const _getStr = (userId: string, idx: number): string => {
    let sendStr = '';
    switch(type) {
      case 'birthday':
        sendStr =
          `<@${userId}>${idx === userIdArrLength ? '' : ', '}`
        break;
      case 'joinday':
        if(params?.todayJoinDayDiffArr[idx]) {
          sendStr =
            `<@${userId}>님 입사 ${params?.todayJoinDayDiffArr[idx]}주년${idx === userIdArrLength ? '' : ', '}`
        }
        break;
    }
    return sendStr;
  }

  let sendStr = '';

  userIdArr.filter((userId: string, idx: number): boolean => {
    if(type === 'birthday') {
      return true;
    }
    if(!params?.todayJoinDayDiffArr[idx]) {
      return false;
    }
    return true;
  })
    .map((userId: string, idx) => {
      sendStr += _getStr(userId, idx);
    });

  let data: any = getPayload(sendStr, type);

  if(!data) {
    logger.warn(`WRONG_DATA_WEBHOOK::${webHookApiUrl}::${JSON.stringify(data)}`);
    return;
  }
  if(!sendStr) {
    logger.warn(`WRONG_SEND_STRING_WEBHOOK::${webHookApiUrl}::${JSON.stringify(sendStr)}`);
    return;
  }
  axiosInstance.post(webHookApiUrl, data)
    .then(rv => {
      logger.info(`SUCCESS_WEBHOOK::${webHookApiUrl}::${JSON.stringify(data)}`);
    })
    .catch((e) => {
      logger.error(`ERROR_MESSAGE::${webHookApiUrl}::${alertErr(e)}`);
    });
};