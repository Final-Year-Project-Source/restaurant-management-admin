'use client';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useChangeStatusItemMutation } from '@/redux/services/kds';
import { getColorByProgressingTime, getFormatDateTime } from '@/utils/commonUtils';
import {
  CANCELLED,
  COMPLETED,
  HEADER_LAYOUT,
  JAGGED_BOTTOM_HEIGHT,
  JAGGED_TOP_HEIGHT,
  PADDING_BLOCK_CONTENT_LAYOUT,
  PADDING_BOTTOM_DIVIDE_HEIGHT,
  PADDING_BOTTOM_HEIGHT,
  SPACE_BETWEEN_ITEMS,
} from '@/utils/constants';
import { lowerCase } from 'lodash';
import { useSession } from 'next-auth/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Tag from '../tag/tag';
import './ticket.scss';

const Ticket = (order: any) => {
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';

  const { height, isMobile } = useWindowDimensions();
  const refHeaderTicket = useRef<HTMLDivElement>(null);
  const refOrderItems = useRef<HTMLDivElement>(null);
  const refTicket = useRef<HTMLDivElement>(null);
  const refFakeTicket = useRef<HTMLDivElement>(null);
  const headerKDSElement = isMobile
    ? document.getElementsByClassName('kds-header-mobile')[0]
    : document.getElementsByClassName('kds-header')[0];
  const maxHeightTicket =
    height - (HEADER_LAYOUT + PADDING_BLOCK_CONTENT_LAYOUT + headerKDSElement.clientHeight + (isMobile ? 0 : 25)); // 57 header page, 40 pt, pb
  const TICKET_DATA = order.order;
  const [ticketData, setTicketData] = useState(TICKET_DATA);
  const [divideTickets, setDivideTickets] = useState<any[][]>([]);

  const [changeStatusItem] = useChangeStatusItemMutation();
  const toggleClick = (item: any) => {
    const newDataStatus = item.status === 'Preparing' ? 'Completed' : 'Preparing';
    const data = {
      bill_id: ticketData.bill_id,
      item_id: item._id,
      status: newDataStatus,
    };
    const updatedItems = ticketData.items.map((i: any) => {
      if (i._id === item._id) {
        return {
          ...i,
          status: newDataStatus,
        };
      }
      return i;
    });
    const updatedTicketData = {
      ...ticketData,
      items: updatedItems,
      completedAt: new Date(),
    };
    const hasPreparingItems = updatedItems.some((i: any) => i.status === 'Preparing');
    setDivideTickets([updatedTicketData.items]);
    setTicketData(() => ({
      ...updatedTicketData,
      status: hasPreparingItems ? 'Preparing' : 'Completed',
    }));

    changeStatusItem({ data, access_token });
  };
  const checkIfCancelled = (status: string) => lowerCase(status) === CANCELLED;
  const checkIfCompleted = (status: string) => lowerCase(status) === COMPLETED;
  const isCompleted = lowerCase(ticketData.status) === COMPLETED;
  //count time in header ticket
  const currentDate = new Date();
  const placedDate = new Date(ticketData?.placed_at);
  const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - placedDate.getTime()) / 1000);
  const minutes = Math.floor(timeDifferenceInSeconds / 60);
  const seconds = timeDifferenceInSeconds % 60;
  const [progressingTime, setProgressingTime] = useState({ minutes: minutes, seconds: seconds });
  const [color, setColor] = useState('');

  useEffect(() => {
    if (isCompleted) {
      const completedAt = new Date(ticketData.completedAt);
      const createdAt = new Date(ticketData.createdAt);
      const timeDifferenceInSeconds = Math.floor((completedAt.getTime() - createdAt.getTime()) / 1000);

      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      const seconds = timeDifferenceInSeconds % 60;

      setProgressingTime({ minutes, seconds });
    } else {
      const intervalId = setInterval(() => {
        const currentDate = new Date();
        const placedDate = new Date(ticketData?.placed_at);
        const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - placedDate.getTime()) / 1000);

        const minutes = Math.floor(timeDifferenceInSeconds / 60);
        const seconds = timeDifferenceInSeconds % 60;

        setProgressingTime({ minutes, seconds });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [ticketData.status]);

  useEffect(() => {
    setColor(getColorByProgressingTime(progressingTime.minutes));
  }, [progressingTime.minutes]);

  useLayoutEffect(() => {
    let result: any[][] = [];
    // const headerKDSElement = document.getElementsByClassName('ticket-header')[0];
    // const headerHeight = headerKDSElement.clientHeight + 50;
    const headerTicketHeight = refHeaderTicket?.current?.clientHeight || 0;
    let cutStartIndex = 0;

    let currentOrderItemsHeight = 0;
    let remainOrderItemsHeight = maxHeightTicket - headerTicketHeight - PADDING_BOTTOM_HEIGHT; // 50: height padding bottom
    ticketData.items?.forEach((_: any, index: number) => {
      const itemHeight =
        document.getElementById(`order-${ticketData._id}-item-${index}`)?.getBoundingClientRect().height || 0;
      currentOrderItemsHeight += itemHeight + SPACE_BETWEEN_ITEMS;
      if (currentOrderItemsHeight >= remainOrderItemsHeight) {
        result.push(ticketData.items?.slice(cutStartIndex, index));
        cutStartIndex = index;
        currentOrderItemsHeight = itemHeight + SPACE_BETWEEN_ITEMS;
        remainOrderItemsHeight =
          maxHeightTicket - (PADDING_BOTTOM_DIVIDE_HEIGHT + JAGGED_TOP_HEIGHT + JAGGED_BOTTOM_HEIGHT); //  65:padding-bottom + 36:jagged-top + 30: jagged-bottom
      }
    });

    // Push the remaining items
    if (cutStartIndex < ticketData.items?.length) {
      result.push(ticketData.items?.slice(cutStartIndex));
    }

    setDivideTickets(result?.length ? result : [ticketData.items]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxHeightTicket, ticketData]);
  const RenderOderItem = ({ idx, item }: { idx: number; item: any }): JSX.Element => (
    <div
      id={`order-${ticketData._id}-item-${idx}`}
      className={`flex flex-col ${item.status !== 'Cancelled' && 'cursor-pointer'} `}
      key={idx}
      onClick={() => {
        if (item.status !== 'Cancelled') {
          toggleClick(item);
        }
      }}
    >
      <div className={`flex cursor-pointer`}>
        <div
          className={`text-[20px] ${checkIfCompleted(item?.status) ? 'line-through' : ''} ${
            checkIfCancelled(item?.status) ? 'text-red-200' : 'text-black-400'
          }`}
        >
          {item.quantity}&nbsp;x&nbsp;&nbsp;
        </div>
        <div>
          <div
            className={`text-[20px] ${checkIfCompleted(item?.status) ? 'line-through' : ''} ${
              checkIfCancelled(item?.status) ? 'text-red-200' : 'text-black-400'
            }`}
          >
            {item.name}
          </div>

          <ul
            className={`list-disc font-open-sans ml-[17px] text-[18px] ${
              checkIfCompleted(item?.status) ? 'line-through' : ''
            } ${checkIfCancelled(item?.status) ? 'text-red-200' : 'text-black-300'}`}
          >
            {item.modifiers_info?.map((mod: any) => mod.id && <li key={mod.id}>{mod.name}</li>)}
            {item.dietary_requests?.map((request: any, index: number) => <li key={index}>{request}</li>)}
            {item.notes && <li key={item.id}>{item.notes}</li>}
          </ul>
        </div>
      </div>

      {checkIfCancelled(item.status) && (
        <Tag className="ml-[34px] !text-red-200 !border-red-200 !w-[68px] mt-[10px]" text={item.status} />
      )}
    </div>
  );

  const RenderHeaderTicket = () => (
    <div
      className="ticket-header flex rounded-t-[16px]"
      style={{
        background: isCompleted ? '' : color,
      }}
      ref={refHeaderTicket}
    >
      <div
        className="bg-header-left w-[13px]"
        style={{
          background: isCompleted ? color : '',
        }}
      ></div>
      <div
        className="bg-header-right pt-[20px] w-full flex flex-col py-5 pl-[12px] pr-[16px]"
        style={{
          background: isCompleted ? 'var(--grey-50)' : '',
        }}
      >
        <span className="text-[20px] font-medium">
          {ticketData.table_name} ({ticketData.location})
        </span>
        <span className="text-[20px] font-medium">{ticketData.customer_name}</span>
        <span key={progressingTime.minutes * 60 + progressingTime.seconds} className="text-[13px] font-open-sans">
          {progressingTime.minutes} min {progressingTime.seconds} sec
        </span>
        <span className="text-[11px] font-open-sans text-black-250">
          Order placed {getFormatDateTime(ticketData.placed_at)}
        </span>
      </div>
    </div>
  );

  const ticketKDSCommonClass = 'ticket-KDS flex flex-col w-[280px] shrink-0 h-full relative';
  return (
    <div className={`flex space-x-[10px] ${isMobile && 'snap-center'}`} ref={refTicket}>
      {!isMobile && !divideTickets?.length && (
        <div ref={refFakeTicket} style={{ height: maxHeightTicket }} className={`${ticketKDSCommonClass}`}>
          <RenderHeaderTicket />
          <div
            className="ticket-body h-fit pt-[30px] pb-[50px] rounded-b-[16px] flex flex-col space-y-[30px] px-[25px] h-full"
            ref={refOrderItems}
          >
            {ticketData.items?.map((item: any, idx: number) => <RenderOderItem key={idx} idx={idx} item={item} />)}
          </div>
        </div>
      )}
      {divideTickets?.map((divideTicket, index) => {
        const isLastTicket = index === divideTickets?.length - 1;
        const isNotFirstTicket = index > 0;
        return (
          <div
            key={`divide-ticket-${index}`}
            // style={{ height: maxHeightTicket }}
            className={`${ticketKDSCommonClass} mb-[5px] ${isLastTicket ? ' rounded-b-[16px]' : ''}`}
          >
            {!index && <RenderHeaderTicket key={`header-ticket-${Date.now()}`} />}
            {isLastTicket ? (
              <div
                className={`ticket-body flex flex-col space-y-[30px] pt-[30px] px-[25px] ${
                  isNotFirstTicket ? 'mt-[10px] pt-[50px]' : ''
                } ${isLastTicket ? ' rounded-b-[16px]' : ''} ${!isLastTicket ? 'pb-[65px]' : 'pb-[50px]'} 
                  ${isNotFirstTicket && 'ticket-body-with-jagged-border-top'}
                  ${!isLastTicket && 'ticket-body-with-jagged-border-bottom'}
                  `}
              >
                {divideTicket?.map((item, idx) => <RenderOderItem key={idx} idx={idx} item={item} />)}
              </div>
            ) : (
              <div
                style={{ height: maxHeightTicket - (!index ? refHeaderTicket?.current?.clientHeight || 0 : 30) - 30 }}
                className={`ticket-body flex flex-col space-y-[30px] pt-[30px] px-[25px] ${
                  isNotFirstTicket ? 'mt-[10px] pt-[50px]' : ''
                } ${isLastTicket ? 'rounded-b-[16px]' : ''} ${!isLastTicket ? 'pb-[65px]' : 'pb-[50px]'} 
                  ${isNotFirstTicket && 'ticket-body-with-jagged-border-top'}
                  ${!isLastTicket && 'ticket-body-with-jagged-border-bottom '}`}
              >
                {divideTicket?.map((item, idx) => <RenderOderItem key={idx} idx={idx} item={item} />)}
              </div>
            )}
            {!isLastTicket && (
              <span className="relative bottom-[30px] text-right right-[20px] text-[13px] font-open-sans text-black-250 z-10">
                Continued →
              </span>
            )}
            {isNotFirstTicket && (
              <span className="absolute top-[20px] text-right left-[20px] text-[13px] font-open-sans text-black-250">
                → Continued
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Ticket;
