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
    id: 3,
    sub_menu: true,
    title: 'Shop',
    link: '/shop',
  },

  {
    id: 4,
    single_link: true,
    title: 'Our Services',
    link: '/coupon',
  },

  {
    id: 7,
    single_link: true,
    title: 'CCTV Quotation',
    link: '/cctv-quotation',
  },

  {
    id: 8,
    single_link: true,
    title: 'PC Quotation',
    link: '/pc-quotation',
  },

  {
    id: 6,
    single_link: true,
    title: 'Contact',
    link: '/contact',
  },

];


export default menu_data;

// mobile_menu
export const mobile_menu = [
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
    title: 'Our Services',
    link: '/coupon',
  },
  {
    id: 4,
    single_link: true,
    title: 'CCTV Quotation',
    link: '/cctv-quotation',
  },
  {
    id: 5,
    single_link: true,
    title: 'PC Quotation',
    link: '/pc-quotation',
  },
  {
    id: 6,
    single_link: true,
    title: 'Contact',
    link: '/contact',
  },
];
