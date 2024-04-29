'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { formatURL } from '@/utils/commonUtils';
import PaginationButton from '../adminPage/PaginationButton';
import { ArrowLeftIcon1, ArrowRightIcon } from '../Icons';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  link: string;
}

export const Pagination: React.FC<PaginationData> = ({ currentPage, totalPages, rowsPerPage, link }) => {
  const router = useRouter();
  const { isMobile, width } = useWindowDimensions();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  params.delete('page');
  params.delete('limit');
  const modifiedParams = formatURL(params.toString());
  const currentPageHandled = currentPage < 1 ? 1 : currentPage > totalPages ? totalPages : currentPage;
  const handleClick = (page: number) => {
    if (page === 1 && rowsPerPage === 10) {
      router.push(`${link}?${modifiedParams}`);
    } else if (page === 1) {
      router.push(`${link}?limit=${rowsPerPage}&${modifiedParams}`);
    } else if (rowsPerPage === 10) {
      router.push(`${link}?page=${page}&${modifiedParams}`);
    } else router.push(`${link}?page=${page}&limit=${rowsPerPage}&${modifiedParams}`);
  };
  //147 is the width of other components that take up space in the mobile width
  //549 is the width of other components that take up space in the width of the big screen
  // 43 or 48 is the width of pagination button + space
  const countNumberPagesNearby = isMobile
    ? Math.floor((width - 114) / (43 * 2) - 1)
    : Math.floor((width - 549) / (48 * 2) - 1);
  const numberPagesNearby = countNumberPagesNearby < 2 && isMobile ? 2 : countNumberPagesNearby;
  return (
    <div className="flex bg-white">
      {currentPage > totalPages ? (
        <div className="flex justify-center m-2 mb-3">
          <h1 className="italic"> No posts found on this page. </h1>
        </div>
      ) : null}
      <div
        className={`flex justify-center ${isMobile ? ` space-x-[5px] max-[375px]:space-x-[2px]` : ` space-x-[10px]`}`}
      >
        <PaginationButton
          variant="navigation"
          onClick={() => handleClick(currentPageHandled - 1)}
          className={`${currentPage < 2 ? 'opacity-50' : 'hover:bg-black-100'}`}
          disabled={currentPage < 2}
        >
          <ArrowLeftIcon1 />
        </PaginationButton>
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          if (
            (currentPageHandled <= numberPagesNearby && pageNumber <= numberPagesNearby * 2 + 1) ||
            (currentPageHandled >= totalPages - numberPagesNearby &&
              pageNumber > totalPages - numberPagesNearby * 2 - 1) ||
            (pageNumber >= currentPageHandled - numberPagesNearby &&
              pageNumber <= currentPageHandled + numberPagesNearby)
          ) {
            return (
              <PaginationButton
                key={pageNumber}
                onClick={() => handleClick(pageNumber)}
                variant={currentPage === pageNumber ? 'active' : 'inactive'}
                className={` ${currentPage === pageNumber ? 'bg-black text-white' : 'bg-white'}`}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </PaginationButton>
            );
          } else if (
            (currentPageHandled <= numberPagesNearby && pageNumber === numberPagesNearby * 2 + 2) ||
            (currentPageHandled > totalPages - numberPagesNearby &&
              pageNumber === totalPages - numberPagesNearby * 2 - 2) ||
            (currentPageHandled > numberPagesNearby && pageNumber === currentPageHandled - numberPagesNearby - 1) ||
            (currentPageHandled > numberPagesNearby && pageNumber === currentPageHandled + numberPagesNearby + 1)
          ) {
            return (
              <PaginationButton disabled variant="space" key={`ellipsis-${pageNumber}`}>
                ...
              </PaginationButton>
            );
          }
          return null;
        })}

        <PaginationButton
          variant="navigation"
          onClick={() => handleClick(currentPageHandled + 1)}
          className={`${currentPage > totalPages - 1 ? 'opacity-50' : 'hover:bg-black-100'}`}
          disabled={currentPage > totalPages - 1}
        >
          <ArrowRightIcon />
        </PaginationButton>
      </div>
    </div>
  );
};
