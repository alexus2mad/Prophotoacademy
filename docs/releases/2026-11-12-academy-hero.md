# Academy homepage hero and partner logos - 12 November 2026

Source `683799c87bdd320470c115adb8743e60c7ae64d7` keeps the homepage hero
on Academy. The Academy portraits still rotate; Studio and Shop are direct
links. The partner marks use one shared artwork file and now share a vertical
centerline and an equal gap, including at the loop boundary.

Architecture and 43 focused tests passed. Local Chrome at 1440px and 390px
verified the fixed hero past the former switch time and after a mobile swipe,
and measured matching logo centers and gaps. Live browser rechecks were
deferred at the owner's request.

Production was activated first (`LV6jLenCpTUk6NqUOwPZd`), followed by staging
(`PuDVpnZq0dlg8UyJFlC58`). Both passed health and live content checks. Staging's
candidate receipt was refreshed after the production switch. Runtime settings
were unchanged. Both environments retain this build and `247346c` for rollback;
obsolete releases and the reviewed temporary transfer files were removed.
