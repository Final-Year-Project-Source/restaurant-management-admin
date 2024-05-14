import { DISCOUNT_TYPE } from '@/enums';
import { capitalize, uniq } from 'lodash';
import moment from 'moment';

export const getFormattedTime = (date: Date) =>
  date ? `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}` : '';

export const getFormatDateTime = (dateString: string | null) => {
  return moment(dateString).format('DD MMM YYYY HH:mm');
};
export const getFormatDate = (dateString: string | null) => {
  return moment(dateString).format('YYYYMMDD');
};
export const formatStartDate = (dateString: any) => {
  if (dateString) return new Date(moment(dateString).format('YYYY-MM-DD 00:00:00'));
  return null;
};
export const formatEndDate = (dateString: any) => {
  if (dateString) return new Date(moment(dateString).format('YYYY-MM-DD 23:59:59'));
  return null;
};
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getModifiersModifier = (modifier_info: any[]) => {
  return modifier_info?.map((modifier) => {
    const sortedOptions =
      (modifier?.modifier_options || [])
        .filter(Boolean)
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0)) || [];

    return {
      id: modifier.id,
      nameGroup: modifier?.name,
      options: sortedOptions.map((option: any) => ({
        label: option.name || '',
        price: option.price > 0 ? option.price.toString() : '',
      })),
    };
  });
};

export const getDietaryRequests = (dietaryRequests: string[]) => {
  return uniq(
    dietaryRequests
      ?.filter((item: string) => item.endsWith('option'))
      .map((item: string) => {
        item = item.replace(' option', '');
        return item;
      }) || [],
  );
};

export const getDiscountedPrice = (price: number, discount?: any) => {
  if (!discount) return price;

  if (discount.type === DISCOUNT_TYPE.FIXED_PERCENT) {
    return Math.round(price * (100 - discount.value) * 0.01);
  } else if (discount.type === DISCOUNT_TYPE.FIXED_AMOUNT) {
    return Math.round(price - discount.value);
  }
  return 0;
};
export const itemsCount = (orders: any) => {
  var temp = 0;
  for (const order of orders) {
    temp += order.items.length;
  }
  return temp;
};
export function numberToOrdinal(index: number): string {
  if (index < 1 || !Number.isInteger(index)) {
    return 'Invalid';
  }

  const units: string[] = [
    'Zero',
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
  ];
  const tens: string[] = [
    'Tenth',
    'Eleventh',
    'Twelfth',
    'Thirteenth',
    'Fourteenth',
    'Fifteenth',
    'Sixteenth',
    'Seventeenth',
    'Eighteenth',
    'Nineteenth',
  ];
  const multiplesOfTen: string[] = [
    'Twentieth',
    'Thirtieth',
    'Fortieth',
    'Fiftieth',
    'Sixtieth',
    'Seventieth',
    'Eightieth',
    'Ninetieth',
  ];
  const others: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

  if (index < 10) {
    return units[index];
  } else if (index >= 10 && index < 20) {
    return tens[index - 10];
  } else if (index % 10 === 0 && index < 100) {
    return multiplesOfTen[Math.floor(index / 10) - 2];
  } else if (index < 100) {
    return `${multiplesOfTen[Math.floor(index / 10) - 2]}-${units[index % 10]}`;
  } else if (index % 100 === 0 && index < 1000) {
    return `${others[Math.floor(index / 100)]} Hundredth`;
  } else if (index < 1000) {
    return `${others[Math.floor(index / 100)]} Hundred ${numberToOrdinal(index % 100)}`;
  } else {
    return 'Unsupported';
  }
}
export const isNumeric = (value: any) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};
export const validateEmail = (email: string) => {
  if (email.trim() === '') {
    return true;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.trim() === '') {
    return true;
  }
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return phoneRegex.test(phoneNumber);
};
export const validateTaxID = (taxID: string) => {
  const taxIDRegex = /^(\d[- ]?){12}\d$/;

  return taxIDRegex.test(taxID);
};
export const validateIsNotEmpty = (value: string) => {
  return value !== undefined && value.trim() !== '';
};

export const getColorByProgressingTime = (duration: number) => {
  if (duration >= 30) {
    return 'var(--red-100)';
  } else if (duration >= 15) {
    return 'var(--yellow-500)';
  } else {
    return 'var(--green-100)';
  }
};
export const formatURL = (url: string) => {
  const decodedURL = decodeURIComponent(url);
  const formattedURL = decodedURL.replace(/%2C/g, ',').replace(/\+/g, '%20');
  return formattedURL;
};

export const getSelectedItems = (selectedValues: string[], options: any[], labelAll: string) => {
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value || option));

  return selectedOptions.length > 0 && selectedOptions.length === options.length
    ? labelAll
    : `${selectedOptions.length} selected`;
};

export const serializeFilters = (filters: {
  search?: string;
  categories?: string[];
  stocks?: string[];
  groups?: string[];
  page?: number | string;
  limit?: number | string;
  startTime?: string;
  endTime?: string;
  orderStatus?: string[];
  paymentStatus?: string[];
  roleFilter?: string[];
  startHour?: number | string;
  endHour?: number | string;
}): string => {
  const {
    search,
    categories,
    stocks,
    groups,
    page,
    limit,
    startTime,
    endTime,
    orderStatus,
    paymentStatus,
    roleFilter,
    startHour,
    endHour,
  } = filters;
  let queryParams = '';
  if (page) {
    queryParams += 'page=' + page + '&';
  }
  if (limit) {
    queryParams += 'limit=' + limit + '&';
  }
  if (search) {
    queryParams += 'search=' + search + '&';
  }
  if (categories && categories.length) {
    queryParams += 'category_filter=' + categories.join(',') + '&';
  }
  if (stocks && stocks.length) {
    queryParams += 'stock_filter=' + stocks.join(',') + '&';
  }
  if (groups && groups.length) {
    queryParams += 'group_filter=' + groups.join(',') + '&';
  }
  if (orderStatus && orderStatus.length) {
    queryParams += 'order_status=' + orderStatus.join(',') + '&';
  }
  if (paymentStatus && paymentStatus.length) {
    queryParams += 'payment_status=' + paymentStatus.join(',') + '&';
  }
  if (roleFilter && roleFilter.length) {
    queryParams += 'role_filter=' + roleFilter.join(',') + '&';
  }
  if (startHour) {
    queryParams += 'start_hour=' + startHour + '&';
  }
  if (endHour) {
    queryParams += 'end_hour=' + endHour + '&';
  }
  if (startTime) {
    queryParams += 'start_time=' + startTime + '&';
  }
  if (endTime) {
    queryParams += 'end_time=' + endTime;
  }

  if (queryParams.endsWith('&')) {
    queryParams = queryParams.slice(0, -1);
  }

  return queryParams;
};

export const handleDownloadCSV = (data: any, csvName: string, columNames: any) => {
  const csvData = data || [];
  const columnNames = columNames;
  let csvContent = columnNames.join(',') + '\n';
  csvData.forEach((row: any) => {
    csvContent += Object.values(row).join(',') + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', csvName);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};
export const generateChartData = (salesSummaryData: any, typeChart: any) => {
  const labels = salesSummaryData?.allData?.map((item: any) => item.label);
  let data;
  switch (typeChart) {
    case 'gross sales':
      data = salesSummaryData?.allData?.map((item: any) => item.grossSales);
      break;
    case 'refunds':
      data = salesSummaryData?.allData?.map((item: any) => item.refunds);
      break;
    case 'discounts':
      data = salesSummaryData?.allData?.map((item: any) => item.discounts);
      break;
    case 'net sales':
      data = salesSummaryData?.allData?.map((item: any) => item.netSales);
      break;
    case 'est. profit':
      data = salesSummaryData?.allData?.map((item: any) => item.estimatedProfit);
      break;
    default:
      data = [];
  }

  return {
    labels,
    datasets: [
      {
        fill: true,
        label: capitalize(typeChart),
        data,
        pointBorderColor: '#131C16',
        pointBorderWidth: 1,
        pointBackgroundColor: '#fff',
        borderColor: '#131C16',
        backgroundColor: 'rgba(19, 28, 22, 0.20)',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 4,
      },
    ],
  };
};
