// import { axiosAuth, HTTP_STATUS } from '@/libs/axios';
// import { useSession } from 'next-auth/react';
// import { useEffect } from 'react';
// import { useRefreshToken } from './useRefreshToken';

// const useAxiosAuth = () => {
//   const { data: session } = useSession();
//   const refreshToken = useRefreshToken();

//   useEffect(() => {
//     const requestIntercept = axiosAuth.interceptors.request.use(
//       (config: { headers: { [x: string]: string; }; }) => {
//         if (!config.headers['Authorization']) {
//           config.headers['Authorization'] = `Bearer ${session?.user.access_token}`;
//         }
//         return config;
//       },
//       (error: any) => Promise.reject(error),
//     );

//     const responseIntercept = axiosAuth.interceptors.response.use(
//       (response: any) => response,
//       async (error: { config: any; response: { status: number; }; }) => {
//         const prevRequest = error.config;
//         if (error.response.status === HTTP_STATUS.UNAUTHORIZED && !prevRequest.sent) {
//           prevRequest.sent = true;
//           await refreshToken();
//           prevRequest.headers['Authorization'] = `Bearer ${session?.user.access_token}`;
//           return axiosAuth(prevRequest);
//         }
//         return Promise.reject(error);
//       },
//     );

//     return () => {
//       axiosAuth.interceptors.request.eject(requestIntercept);
//       axiosAuth.interceptors.response.eject(responseIntercept);
//     };
//   }, [session, refreshToken]);

//   return axiosAuth;
// };

// export default useAxiosAuth;
