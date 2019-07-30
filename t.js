const str =
    'C161_996557606 admin_2019-06-12 10-53-50_BR101723 Quantitation Ct Results.csv';

const m = str.split('_');
const [a, b, c, d] = m;
console.log(d.replace(/[ -].*/g, ''));
