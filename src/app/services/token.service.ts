import { Injectable } from '@angular/core';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { getCookie, removeCookie, setCookie } from 'typescript-cookie';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  saveToken(token: string) {
    // localStorage.setItem('token', token);
    setCookie('token-trello', token, { expires: 365, path: '/' });
  }

  getToken() {
    // const token = localStorage.getItem('token');
    const token = getCookie('token-trello');
    return token;
  }

  removeToken() {
    // localStorage.removeItem('token');
    removeCookie('token-trello');
  }

  saveRefreshToken(token: string) {
    // localStorage.setItem('token', token);
    setCookie('refresh-token-trello', token, { expires: 365, path: '/' });
  }

  getRefreshToken() {
    // const token = localStorage.getItem('token');
    const token = getCookie('refresh-token-trello');
    return token;
  }

  removeRefreshToken() {
    // localStorage.removeItem('token');
    removeCookie('refresh-token-trello');
  }

  isValidToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decodeToken = jwtDecode<JwtPayload>(token);
    if (decodeToken && decodeToken?.exp) {
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();
    }
    return false;
  }

  isValidRefreshToken() {
    const token = this.getRefreshToken();
    if (!token) {
      return false;
    }

    const decodeToken = jwtDecode<JwtPayload>(token);
    if (decodeToken && decodeToken?.exp) {
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();
    }
    return false;
  }
}
