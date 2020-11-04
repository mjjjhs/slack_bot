import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {logger} from "../config/winston";
import isMatch from "date-fns/isMatch";

const axiosInstance = axios.create({
  timeout: 10000
});

axiosInstance.interceptors.request.use(
  (config): AxiosRequestConfig => {
    if(config.method === 'get') {
      logger.info(`CALL API::${config.url}::${JSON.stringify(config.params)}`);
    } else {
      logger.info(`CALL WEBHOOK::${config.url}::${JSON.stringify(config.data)}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response): AxiosResponse<void> => {
    return response;
  },
  (error) => Promise.reject(error)
);
export {axiosInstance};

export const alertErr = (e: any): string => {//엑시오스 인터셉트 에러 로직 추가
  if (e.response) {
    if(e.response.data?.error?.message) {
      return e.response.data?.error?.message;
    }
    return e.response.statusText;
  } else {
    return e.message;
  }
};

export const getFixedDateType = (date: string, name: string, type: string): string | null => {
  const haveTypeArr: string[] = [
    'yy.MM.dd',
    'yy/MM/dd',
    'yy-MM-dd',
    'yyyy.MM.dd',
    'yyyy-MM-dd',
    'yyyy/MM/dd',
    'yyyy-M-d',
    'yyyy/M/d',
    'yyyy.M.d',
    'yy/M/d',
    'yy.M.d',
    'yy-M-d',
    'M/d',
    'M-d',
    'M.d',
    'M/dd',
    'M.dd',
    'M-dd',
    'MM/d',
    'MM.d',
    'MM-d',
    'MM/dd',
    'MM-dd',
    'MM.dd'
  ];
  let fixedDateType: string[] = haveTypeArr.filter((item: string): boolean => isMatch(date, item));
  fixedDateType.length || logger.warn(`WRONG_DATE_TYPE::${type}::${name}::${date}`);

  if(!fixedDateType.length) {
    return null;
  }
  return fixedDateType[0];
};
interface IPayloadOpt {
  msg: {
    main: string;
    sub: string;
  },
  imoji: string;
  image: {
    image_url: string;
    alt_text: string;
  }
}
export const getPayload = (sendStr: string, type: string): any => {
  const _getPayloadOpt = (sendStr: string, type: string): IPayloadOpt => {
    const rv: any = {
      'birthday': {
        msg: {
          main: `*${sendStr}님 생일축하합니다!!*`,
          sub: `*오늘만큼은 ${sendStr}님이 행복한 시간 보내시길 빕니다.* \n\n *맛난거 드시고 알차게 보내세용~* \n\n\n`
        },
        imoji: ':birthday: :congrat1: :congrat2: :gohome: :hangul-offwork: :birthday-hangul: :celeryman: \n\n\n',
        image: {
          image_url: "https://mjjjhs.synology.me/web_images/happy-birthday.jpg",
          alt_text: "happy birthday image"
        }
      },
      'joinday': {
        msg: {
          main: `*${sendStr} 축하합니다!!*`,
          sub: `*한 해 정말 수고 많으셨습니다.* \n\n *오늘만큼은 일찍 귀가하실꺼죠?* \n\n\n`
        },
        imoji: ':congrat1: :congrat2: :attention_please: :goseng: :gooood: :+1: :celeryman: \n\n\n',
        image: {
          image_url: "https://mjjjhs.synology.me/web_images/yanolja_logo.png",
          alt_text: "happy join yanolja image"
        }
      }
    };
    return rv[type];
  };
  const opt = _getPayloadOpt(sendStr, type);
  const {msg:{main, sub}, imoji, image:{image_url, alt_text}} = opt;
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: main
        }
      },
      {
        type: "section",
        block_id: "section567",
        text: {
          type: "mrkdwn",
          text: `${imoji}${sub}`
        },
        accessory: {
          type: "image",
          image_url,
          alt_text
        }
      },
      {
        type: "section",
        block_id: "section789",
        fields: [
          {
            type: "mrkdwn",
            text: "*<!here> said:*\n"
          }
        ]
      }
    ],
    attachments: [
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: ":cantgo:"
            }
          }
        ]
      }
    ]
  };
};