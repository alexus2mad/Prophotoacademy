# Enable isolated staging page publication

## Why
The Academy staging environment forbids the general Sanity write token. The new public page editor needs a separate server-side credential for the staging marketing project.

## What Changes
Permit the editor’s dedicated credential in the staging runtime and restrict it to the existing public marketing dataset of the staging project. Keep the private learning writer separate. Preserve existing production configuration and exclude the credential from review builds.

## Capabilities
- Modified: site-page-editing.

## Impact
Editor client configuration, staging environment validation, static review environment and deployment guidance.
