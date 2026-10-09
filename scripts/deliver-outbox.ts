import './environment';
import { deliverOutbox } from '../src/lib/ledger';
import { deliverNotifications } from '../src/lib/notifications/delivery';
console.log(await (process.env.DATABASE_URL ? deliverNotifications() : deliverOutbox()));
