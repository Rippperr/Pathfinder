# Career catalog maintenance

Pathfinder's role guides and learning links are curated product content, not live job-market data or guarantees of hiring demand. Keep that distinction visible in the app.

## Review each role guide

For every content review, record:

- role title and reviewer;
- review date and target geography (or explicitly state that the guide is general/global);
- representative, current job descriptions used to check responsibilities and optional skills;
- primary framework or official learning sources used to check the roadmap;
- links checked and any changed, removed, or replaced resources;
- the specific content changes and remaining uncertainty.

Do not update a review date merely because code changed. Only mark content reviewed after checking current sources. Treat optional skills as employer-dependent and separate them from the core roadmap.

## Link validation

`careerCatalog.test.js` checks that each built-in resource has a description and a valid HTTPS URL. This is a deterministic syntax check; it does not prove that a third-party page remains live or that its content is still suitable. During a human review, open each resource, confirm that it is accessible without unexpected paywalls where described as free, and verify that it teaches the associated skills. Avoid making external-link checks a hard CI gate because third-party sites commonly block automated requests or change availability temporarily.

## Safe content updates

Update `roleCurricula.js` for sequenced core skills and `careerCatalog.js` for role context and resource references. Run the frontend tests and production build, then review the changed role guides in the app before release. Keep specialized or fast-changing tools in optional skills unless broad evidence supports making them core.
