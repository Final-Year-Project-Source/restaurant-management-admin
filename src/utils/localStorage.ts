import { QueryParamsState } from '@/redux/features/queryParamsSlice';

export const setEmail = (email: string) => {
  localStorage?.setItem('email', email || '');
};
export const getEmail = () => {
  if (typeof window !== 'undefined') return localStorage?.getItem('email');
};
export const removeEmail = () => {
  localStorage?.removeItem('email');
};
export const setPasswd = (password: string) => {
  localStorage?.setItem('password', password || '');
};
export const getPasswd = () => {
  if (typeof window !== 'undefined') return localStorage?.getItem('password');
};
export const removePasswd = () => {
  localStorage?.removeItem('password');
};
export const setOtpURL = (otp_auth_url: string) => {
  localStorage?.setItem('otp_auth_url', otp_auth_url || '');
};
export const getOtpURL = () => {
  if (typeof window !== 'undefined') return localStorage?.getItem('otp_auth_url');
};
export const removeOtpURL = () => {
  localStorage?.removeItem('otp_auth_url');
};

export const setAccessToken = (access_token: string) => {
  localStorage?.setItem('access_token', access_token || '');
};
export const getAccessToken = () => {
  if (typeof window !== 'undefined') return localStorage?.getItem('access_token');
};
export const removeAccessToken = () => {
  localStorage?.removeItem('access_token');
};

//user app
const tryParseJSONObject = (jsonString: string): object | null | string => {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {
    return null;
  }

  return jsonString;
};

// region Access Token

export const getBasket = () => {
  if (typeof window !== 'undefined')
    return tryParseJSONObject(localStorage.getItem('basket') || '') || { orderItems: [] };
};

export const getFilerDietaryRestrictions = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('dietaryRestrictions') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  }

  return [];
};

export const removeFilerDietaryRestrictions = (): void => {
  localStorage.removeItem('dietaryRestrictions');
};

export const getFilerProtein = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('protein') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  }

  return [];
};
export const removeFilerProtein = (): void => {
  localStorage.removeItem('protein');
};
export const removeBasket = (): void => {
  localStorage.removeItem('basket');
};

export const getTableId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('table_id');
  }
  return '';
};
export const removeTableId = (): void => {
  localStorage.removeItem('table_id');
};
export const getBillSearch = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bill_search');
  }
  return '';
};
export const removeBillSearch = (): void => {
  localStorage.removeItem('bill_search');
};
export const getBillOrderStatus = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('bill_order_status') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};
export const removeBillOrderStatus = (): void => {
  localStorage.removeItem('bill_order_status');
};
export const getBillPaymentStatus = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('bill_payment_status') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};
export const removeBillPaymentStatus = (): void => {
  localStorage.removeItem('bill_payment_status');
};

export const getBillStartTimeFilter = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bill_start_time_filter');
  }
  return '';
};
export const removeBillStartTimeFilter = (): void => {
  localStorage.removeItem('bill_start_time_filter');
};
export const getBillEndTimeFilter = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bill_end_time_filter');
  }
  return '';
};
export const removeBillEndTimeFilter = (): void => {
  localStorage.removeItem('bill_end_time_filter');
};

export const getEmployeeRoleFilter = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('employee_role_filter') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};
export const removeEmployeeRoleFilter = (): void => {
  localStorage.removeItem('employee_role_filter');
};
export const getProductCategoryFilter = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('product_category_filter') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};
export const removeProductCategoryFilter = (): void => {
  localStorage.removeItem('product_category_filter');
};
export const getProductGroupFilter = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('product_group_filter') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};

export const getModifierSearch = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('modifier_search');
  }
  return '';
};
export const removeModifierSearch = (): void => {
  localStorage.removeItem('modifier_search');
};

export const removeProductGroupFilter = (): void => {
  localStorage.removeItem('product_group_filter');
};
export const getProductStockFilter = () => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem('product_stock_filter') || '';
    const parsedValue = tryParseJSONObject(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  }
  return null;
};
export const removeProductStockFilter = (): void => {
  localStorage.removeItem('product_stock_filter');
};

export const getQueryParams = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('queryParams');
    if (storedData) {
      const parsedData = tryParseJSONObject(storedData) as QueryParamsState;
      if (parsedData && typeof parsedData === 'object') {
        return parsedData;
      }
    }
  }
  return null;
};

export const removeQueryParams = (): void => {
  localStorage.removeItem('queryParams');
};

export const getURLPages = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('URLPages');
    if (storedData) {
      const parsedData = tryParseJSONObject(storedData);
      if (parsedData && typeof parsedData === 'object') {
        return parsedData;
      }
    }
  }
  return null;
};

export const removeURLPages = (): void => {
  localStorage.removeItem('URLPages');
};
// end region
