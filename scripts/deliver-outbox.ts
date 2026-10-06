import './environment';
import {deliverOutbox} from '../src/lib/ledger';
console.log(await deliverOutbox());
