import type {Metadata} from 'next';
import {getContent} from '@/lib/content';
import {canonicalUrl} from '@/lib/ecosystem';
import {StudioBooking} from '@/components/studio-booking';
export const metadata:Metadata={title:'Бронювання студії',robots:{index:false,follow:true},alternates:{canonical:canonicalUrl('hub','booking')}};
export default async function Booking({searchParams}:{searchParams:Promise<{room?:string}>}){const {room}=await searchParams;const content=await getContent();const selected=content.rooms.find(item=>item.bookingKey===room);return <div className="booking-page container"><StudioBooking providerUrl={content.hub.bookingUrl} roomKey={selected?.bookingKey} roomTitle={selected?.title} phone={content.hub.phone}/></div>;}
