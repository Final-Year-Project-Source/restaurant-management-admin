import axios from 'axios';

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};

export default axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosAuth = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
