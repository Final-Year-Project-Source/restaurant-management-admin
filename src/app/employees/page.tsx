'use client';
import React, { useEffect, useMemo, useState } from 'react';

import Dropdown from '@/components/dropdown/Dropdown';
import Table from '@/components/table/Table';
import Tag from '@/components/tag/tag';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetUsersQuery } from '@/redux/services/employeeApi';
import { RootState } from '@/redux/store';
import { getFormatDateTime, getSelectedItems, serializeFilters } from '@/utils/commonUtils';
import { DEFAULT_ROLE_FILTER, PAGINATIONLIMIT, ROLE_EMPLOYEE, ROLE_FILTER } from '@/utils/constants';
import type { ColumnsType } from 'antd/es/table';
import { startCase } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import './employees.scss';
import { useSession } from 'next-auth/react';
interface User {
  key: React.Key;
  id: string;
  name: string;
  role: string;
  email: string;
  otp_enabled: boolean;
  access_token: string;
  updatedAt: string;
  created_at: string;
  isEmailVerified: boolean;
}

export default function Employees() {
  const { data: session } = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const [users, setUsers] = useState<User[]>([]);

  const queryParams = useSelector((state: RootState) => state.queryParams.employees);

  const { data: dataRes, isFetching } = useGetUsersQuery({
    access_token: session?.user?.access_token,
    role_filter: queryParams?.roleFilter || [],
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
  });

  const totalPages = dataRes?.totalPages;
  const page = parseInt(searchParams.get('page') || '1');
  const limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams.get('limit') || ''))
    ? parseInt(searchParams.get('limit') || '')
    : 10;
  // const totalPage = useMemo(() => {
  //   const total = dataRes?.totalRow;
  //   if (!isNaN(total)) {
  //     return Math.ceil(total / limitUrl);
  //   }
  // }, [dataRes, limitUrl]);
  const pageUrl = useMemo(() => (page > 0 && totalPages >= page ? page : 1), [page]);

  const roleUrl = searchParams?.get('role_filter')?.split(',') || [].filter((value) => ROLE_EMPLOYEE.includes(value));

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 100,
      render: (name) => <p>{name}</p>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
      width: 120,
      responsive: ['md'],
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 100,
      render: (role) => <p>{role}</p>,
    },
    {
      title: 'Verified',
      dataIndex: 'isEmailVerified',
      width: 80,
      render: (isEmailVerified) => (
        <Tag
          className="absolute top-[16.5px]"
          variant={isEmailVerified ? 'active' : 'disable'}
          text={isEmailVerified ? 'Enable' : 'Disable'}
        />
      ),
    },
  ];

  useEffect(() => {
    setUsers(dataRes?.data);
  }, [dataRes]);

  const userList = users?.map((user: any, index: number) => ({
    ...user,
    key: index,
    name: startCase(user.name),
    email: user.email,
    otp_enabled: user.otp_enabled,
    created_at: getFormatDateTime(user.created_at),
    updated_at: getFormatDateTime(user.updated_at),
  }));

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'employees', value: values }));
  };

  useEffect(() => {
    let URL = '/employees?';
    if (!queryParams?.visited) {
      URL += serializeFilters({
        roleFilter: DEFAULT_ROLE_FILTER,
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        roleFilter: queryParams?.roleFilter,
        page: queryParams?.page,
        limit: queryParams?.limit,
      });
    }

    router.push(URL);
  }, [queryParams?.roleFilter, queryParams?.page, queryParams?.limit, queryParams?.visited]);

  useEffect(() => {
    if (roleUrl.length) {
      dispatch(
        updateQueryParams({
          key: 'employees',
          value: {
            ...queryParams,
            visited: true,
            roleFilter: roleUrl,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ employees: `/employees?${searchParams}` }));
    }
  }, [searchParams]);

  const filterComponent = (
    <>
      <div className={`role-filter-employees-ui w-full min-w-[199px] ${isMobile && `hidden !mb-0`}`}>
        <Dropdown
          id="roles"
          mode="multiple"
          labelItem={getSelectedItems(
            queryParams?.roleFilter || DEFAULT_ROLE_FILTER,
            ROLE_FILTER[0].statuses,
            'All roles',
          )}
          labelAll="All roles"
          options={ROLE_FILTER[0].statuses}
          onChange={(value) => handleUpdateParamsToURL({ roleFilter: value, page: 1, limit: 10 })}
          value={queryParams?.roleFilter}
        />
      </div>
    </>
  );

  const handleRowClick = (record: any) => {
    router.push(`employees/edit?id=${record?.id}`);
  };

  return (
    <div className={`bg-white rounded-2xl ${isMobile ? `w-full` : `w-fit`}`}>
      <Table
        title="New employee"
        // onSearch={handleSearch}
        columns={columns}
        dataSource={userList}
        onAdd={() => router.push(`employees/add`)}
        isLoading={isFetching}
        onRowClick={handleRowClick}
        cursorPointerOnRow
        maxWidth={isMobile ? width : 657}
        page={pageUrl || 1}
        rowPerPage={limitUrl || 10}
        totalPage={totalPages}
        routerLink="/employees"
        keyPage="employees"
      >
        {filterComponent}
      </Table>
    </div>
  );
}
