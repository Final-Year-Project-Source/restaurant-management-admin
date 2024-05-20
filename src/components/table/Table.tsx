'use client';
import Button from '@/components/adminPage/Button';
import SearchInput from '@/components/adminPage/SearchInput';
import '@/components/table/table.scss';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { RootState } from '@/redux/store';
import {
  HEADER_LAYOUT,
  PADDING_BLOCK_CONTENT_LAYOUT,
  PADDING_BOTTOM_TO_SCROLL,
  ROWSPERPAGE,
  TABLE_FOOTER_HEIGHT,
  TABLE_FOOTER_HEIGHT_ON_MOBILE,
  TABLE_HEADER_HEIGHT,
  TABLE_PADDING_BLOCK,
} from '@/utils/constants';
import { ConfigProvider, Table as TableElement } from 'antd';
import { ColumnType, TableRowSelection } from 'antd/es/table/interface';
import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from '../dropdown/Dropdown';
import NoResult from '../NoResult';
import { Pagination } from '../Pagination';
import { SkeletonRows } from './SkeletonRows';
import SkeletonTable, { SkeletonTableColumnsType } from './skeletonTable';

interface TableType {
  rowSelection?: TableRowSelection<any>;
  columns: ColumnType<any>[];
  dataSource: any[];
  title?: string;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd?: () => void;
  size?: any;
  scroll?: any;
  isLoading?: boolean;
  className?: string;
  onRowClick?: (record: any) => void;
  cursorPointerOnRow?: boolean;
  maxWidth?: number;
  page?: number;
  rowPerPage?: number;
  totalPage?: number;
  children?: React.ReactNode;
  routerLink?: string;
  defaultSearchValue?: string;
  isOpenSearchInput?: boolean;
  hiddenPagination?: boolean;
  noPlusOnTitle?: boolean;
  setIsOpenSearch?: () => void;
  keyPage?: keyof RootState['queryParams'];
  noScroll?: boolean;
}

const Table: React.FC<TableType> = ({
  rowSelection,
  columns,
  dataSource,
  title,
  onSearch,
  onAdd,
  size = 'small',
  isLoading,
  className,
  onRowClick,
  maxWidth, // ?????
  cursorPointerOnRow,
  page,
  rowPerPage,
  totalPage,
  children,
  routerLink,
  defaultSearchValue,
  isOpenSearchInput = false,
  setIsOpenSearch,
  hiddenPagination = false,
  noPlusOnTitle = false,
  keyPage,
  noScroll = false,
}) => {
  const { isMobile, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef, [dataSource?.length]);

  const dispatch = useDispatch();
  const queryParams = useSelector((state: RootState) => state.queryParams);

  const handleChangeLimit = (value: number) => {
    if (keyPage) {
      dispatch(updateQueryParams({ key: keyPage, value: { limit: value || 10, page: 1 } }));
    }
  };

  return (
    <div
      ref={bodyRef}
      className={`${noScroll ? '' : ` max-md:overflow-y-auto`} customized-table bg-white ${
        isMobile ? '' : 'rounded-xl'
      }`}
      style={{
        ...(maxWidth ? { maxWidth: maxWidth + 'px' } : {}),
        height: isMobile ? `calc(${height}px - ${TABLE_FOOTER_HEIGHT_ON_MOBILE}px - ${HEADER_LAYOUT}px)` : 'auto',
      }}
    >
      {(children || onSearch || onAdd) && (
        <div
          className={`filters-section flex w-full pb-[10px] max-xl:flex-col-reverse max-md:p-[20px] p-[25px] items-center justify-between`}
        >
          {children && <div className={`filters-status-date-range w-full flex`}>{children}</div>}

          <div
            className={`search-add ${
              !onSearch && ` !mb-0 `
            }self-start flex items-center max-xl:flex-row-reverse max-xl:justify-between justify-end`}
          >
            {onSearch && (
              <SearchInput
                className={`search-animation ${isOpenSearchInput ? 'active' : ''}`}
                placeholder=""
                isOpenSearch={isOpenSearchInput}
                onChange={onSearch}
                defaultValue={defaultSearchValue}
                height={38}
                toggleSearch={setIsOpenSearch}
              />
            )}
            {onAdd && (
              <Button className="max-w-[190px]" variant="secondary" disabled={isLoading} onClick={onAdd}>
                {noPlusOnTitle ? title : `+ ${title}`}
              </Button>
            )}
          </div>
        </div>
      )}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: 'grey',
            controlOutlineWidth: 1,
          },
        }}
      >
        {isLoading ? (
          <SkeletonTable
            rowCount={rowPerPage || 10}
            loading={isLoading}
            columns={columns as SkeletonTableColumnsType[]}
          />
        ) : (
          <TableElement
            className={`scroll-bar ${className || ''}`}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={isLoading ? [] : dataSource}
            size={size}
            style={cursorPointerOnRow ? { cursor: 'pointer' } : { cursor: '' }}
            pagination={false}
            locale={{
              emptyText: (
                <div
                  className="pt-[30px] flex justify-center items-start"
                  style={{
                    height:
                      height -
                      (HEADER_LAYOUT +
                        PADDING_BLOCK_CONTENT_LAYOUT +
                        TABLE_HEADER_HEIGHT +
                        TABLE_FOOTER_HEIGHT +
                        TABLE_PADDING_BLOCK),
                  }}
                >
                  <NoResult />
                </div>
              ),
            }}
            onRow={(record, rowIndex) => {
              return {
                onClick: () => onRowClick && onRowClick(record), // click row
              };
            }}
          />
        )}
      </ConfigProvider>
      {!hiddenPagination && (
        <div>
          {isLoading ? (
            <div className={`flex justify-between ${isMobile ? 'hidden' : 'h-fit'}`}>
              <div className="my-5 skeleton-pagination">
                <SkeletonRows />
              </div>
              <div className="my-5 mr-5">
                <SkeletonRows />
              </div>
            </div>
          ) : (
            // !!totalPage ?
            //check pagination variables before displaying it
            <div
              className={`footer-bills-page flex flex-wrap items-center justify-between pt-5 ${
                isMobile
                  ? `px-[10px] fixed-footer ${
                      scrollBottom > PADDING_BOTTOM_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
                    }`
                  : `px-[15px]`
              }`}
            >
              <div className={`pagination-container ${isMobile ? `w-full m-[auto]` : ``}`}>
                <Pagination
                  currentPage={(keyPage && (queryParams[keyPage] as any)?.page) || 1}
                  totalPages={totalPage || 1}
                  rowsPerPage={rowPerPage || 10}
                  link={routerLink || ''}
                />
              </div>
              <div className="!ml-auto rows-per-page-container">
                <Dropdown
                  id={`row-per-page${rowPerPage}`}
                  className="max-w-[148px]"
                  includeEmptyValue={false}
                  mode="tags"
                  label=""
                  defaultValue="10 per row"
                  options={ROWSPERPAGE}
                  value={rowPerPage}
                  onChange={(value) => handleChangeLimit(value)}
                  placeholder=""
                />
              </div>
            </div>
            // ) : (//
          )}
          <div className={`${noScroll && isMobile ? 'h-[172px]' : ''}`}></div>
        </div>
      )}
    </div>
  );
};

export default Table;
