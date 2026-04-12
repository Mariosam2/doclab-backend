import 'dotenv/config';
import { Response } from 'express';
import { z } from 'zod/v4';
import jwt from 'jsonwebtoken';
import { prisma } from '@src/lib/prisma';

export const getEnvOrThrow = (variableName: string): string => {
  const envVariable = process.env[variableName];
  if (!envVariable) {
    throw new Error(`${variableName} is not defined`);
  }
  return envVariable;
};

export const messageFromPrismaError = (errorCode: string, model: string) => {
  switch (errorCode) {
    case 'P2002': // unique constraint
      return `${model} already exists`;

    case 'P2025': // record not found
      return `${model} not found`;

    case 'P2003': // foreign key constraint
      return 'related record not found';

    case 'P2014': // relation violation
      return 'relation constraint violated';

    default:
      return 'unknown error';
  }
};

export const returnValidationErrorsReponse = (result: z.ZodSafeParseResult<any>, res: Response) => {
  return res.status(400).json({
    success: false,
    message: result.error?.issues[0].message,
  });
};

export const signTokensAndCookie = (res: Response, user: { userId: string; tokenVersion: number }) => {
  const { userId, tokenVersion } = user;
  const accessToken = jwt.sign({ userId, tokenVersion }, getEnvOrThrow('JWT_SECRET'), {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId, tokenVersion }, getEnvOrThrow('JWT_SECRET'), {
    expiresIn: '5d',
  });

  res.cookie('RefreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

export const invalidateTokens = async (userId: string) => {
  await prisma.user.update({
    where: { userId },
    data: { tokenVersion: { increment: 1 } },
  });
};

export const addDays = (date: Date, days: number) => {
  date.setDate(date.getDate() + days);
  return date;
};

export const prosemirrorToHTML = (node: any): string => {
  //console.log(node);
  if (!node?.content) return '';
  return node.content
    .map((n: any) => {
      switch (n.type) {
        case 'paragraph':
          console.log(n);
          return `<p>${prosemirrorToHTML(n)}</p>`;
        case 'text':
          return n.text || '';
        case 'heading':
          return `<h${n.attrs?.level}>${prosemirrorToHTML(n)}</h${n.attrs?.level}>`;
        case 'bulletList':
          return `<ul>${prosemirrorToHTML(n)}</ul>`;
        case 'listItem':
          return `<li>${prosemirrorToHTML(n)}</li>`;
        case 'imageResize':
          console.log(n.attrs);
          return `<div style="${n.attrs?.wrapperStyle}"><div style="${n.attrs?.containerStyle}"><img width="${n.attrs?.width}" height="auto" src="${n.attrs?.src}" /></div></div>`;

        default:
          return prosemirrorToHTML(n);
      }
    })
    .join('');
};
