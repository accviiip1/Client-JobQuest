import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8800";

export const apiImage = `${baseURL}/images/`;

export const apiCv = `${baseURL}/cv/`;

export const makeRequest = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});
