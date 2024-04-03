import { jwtDecode } from 'jwt-decode';

type JWTDecoded = {
  exp: number;
};

export const getExpDate = (token: string) => {
    const decoded: JWTDecoded = jwtDecode(token);
    const exp = new Date(decoded.exp * 1000);
    return exp;
  };