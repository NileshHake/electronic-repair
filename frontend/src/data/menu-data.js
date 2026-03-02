import home_1 from '@assets/img/menu/menu-home-1.jpg';
import home_2 from '@assets/img/menu/menu-home-2.jpg';
import home_3 from '@assets/img/menu/menu-home-3.jpg';
import home_4 from '@assets/img/menu/menu-home-4.jpg';

const menu_data = [
  {
    id: 1,
    homes: true,
    title: 'Home',
    link: '/',
  },
  {
    id: 2,
    sub_menu: true,
    title: 'Shop',
    link: '/shop',
  },
  {
    id: 3,
    single_link: true,
    title: 'Rental Device',
    link: '/rental-device',
  },
  {
    id: 4,
    single_link: true,
    title: 'AMC',
    link: '/amc',
  },
  {
    id: 5,
    single_link: true,
    title: 'CCTV Quote',
    link: '/cctv-quotation',
  },
  {
    id: 6,
    single_link: true,
    title: 'PC Quote',
    link: '/pc-quotation',
  },
  {
    id: 7,
    single_link: true,
    title: 'Our Services',
    link: '/coupon',
  },
  {
    id: 8,
    single_link: true,
    title: 'Contact',
    link: '/contact',
  },
];

export default menu_data;


// ✅ Mobile Menu (Same Priority Order)

export const  mobile_menu = [
  {
    id: 1,
    single_link: true,
    title: 'Home',
    link: '/',
  },
  {
    id: 2,
    single_link: true,
    title: 'Shop',
    link: '/shop',
  },
  {
    id: 3,
    single_link: true,
    title: 'Rental Device',
    link: '/rental-device',
  },
  {
    id: 4,
    single_link: true,
    title: 'AMC',
    link: '/amc',
  },
  {
    id: 5,
    single_link: true,
    title: 'CCTV Quotation',
    link: '/cctv-quotation',
  },
  {
    id: 6,
    single_link: true,
    title: 'PC Quotation',
    link: '/pc-quotation',
  },
  {
    id: 7,
    single_link: true,
    title: 'Our Services',
    link: '/coupon',
  },
  {
    id: 8,
    single_link: true,
    title: 'Contact',
    link: '/contact',
  },
];