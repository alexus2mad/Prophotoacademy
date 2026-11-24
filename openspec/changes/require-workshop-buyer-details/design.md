## Decisions

- Use the existing Academy checkout form and order endpoint. Resolve authored workshop tickets against their catalog and current published binding. Remove the order entry point used by direct-payment buttons while retaining verified callback handling for existing hosted orders.
- Publish the supplied cover facts through each environment's existing inspector. Date and venue are already in the announcement. The owner deferred inline editing so the checkout fix can ship first.
