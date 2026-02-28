# [1.9.0](https://github.com/SeismicScope/seismic-backend/compare/v1.8.0...v1.9.0) (2026-02-28)

### Features

- **earthquake:** add geom_3857 column with SRID 3857 projection for spatial queries ([a3e9e9e](https://github.com/SeismicScope/seismic-backend/commit/a3e9e9e48416d29ac5e94adf1e2004a5cdd8f1ff))

# [1.8.0](https://github.com/SeismicScope/seismic-backend/compare/v1.7.0...v1.8.0) (2026-02-28)

### Features

- **shortener:** add redirect endpoint to controller ([7441aa2](https://github.com/SeismicScope/seismic-backend/commit/7441aa273b716b61ef5e5c5d4069b59e09740c75))

# [1.7.0](https://github.com/SeismicScope/seismic-backend/compare/v1.6.0...v1.7.0) (2026-02-28)

### Features

- **shortener:** add endpoint to resolve short code to original URL ([960c148](https://github.com/SeismicScope/seismic-backend/commit/960c14838f6fd43b0faa5400bb1e7bfd291017e9))

# [1.6.0](https://github.com/SeismicScope/seismic-backend/compare/v1.5.0...v1.6.0) (2026-02-28)

### Features

- **shortener:** add expiration and cleanup for short links ([df2e7aa](https://github.com/SeismicScope/seismic-backend/commit/df2e7aa49cc1cefda75aed2ca63f6060254828f5))
- **shortener:** add QR code generation endpoint for short links ([7aab62e](https://github.com/SeismicScope/seismic-backend/commit/7aab62e3d3cd9bd341d0ab312a55b72353be4b1b))

# [1.5.0](https://github.com/SeismicScope/seismic-backend/compare/v1.4.0...v1.5.0) (2026-02-28)

### Features

- **shortener:** add URL shortener module with Redis caching ([b265719](https://github.com/SeismicScope/seismic-backend/commit/b2657192af57589ca094f280c0dd4e5ebc0554a1))

# [1.4.0](https://github.com/SeismicScope/seismic-backend/compare/v1.3.2...v1.4.0) (2026-02-28)

### Features

- **db:** add pre-transformed EPSG:3857 geometry column with spatial index for earthquakes ([42c748f](https://github.com/SeismicScope/seismic-backend/commit/42c748f8fbd7a3252b65759e473ff476f7a0c365))

## [1.3.2](https://github.com/SeismicScope/seismic-backend/compare/v1.3.1...v1.3.2) (2026-02-27)

### Bug Fixes

- **auth:** set sameSite cookie attribute to 'none' for all environments ([3e0ba89](https://github.com/SeismicScope/seismic-backend/commit/3e0ba89324071522995fa33781ec989b9bb59554))

## [1.3.1](https://github.com/SeismicScope/seismic-backend/compare/v1.3.0...v1.3.1) (2026-02-27)

### Bug Fixes

- **map:** transform geometry to Web Mercator (EPSG:3857) for vector titles ([446515d](https://github.com/SeismicScope/seismic-backend/commit/446515d2cd5d943da8e779507342f3a6dbcaf2e7))

# [1.3.0](https://github.com/SeismicScope/seismic-backend/compare/v1.2.0...v1.3.0) (2026-02-27)

### Features

- **map:** add vector tile endpoint for earthquake data visualization ([490d411](https://github.com/SeismicScope/seismic-backend/commit/490d411580af6eefd72f2e5755dd8c145db74733))

# [1.2.0](https://github.com/SeismicScope/seismic-backend/compare/v1.1.0...v1.2.0) (2026-02-27)

### Features

- **map:** add coordinate rounding for cache optimization and order results by date ([5992c57](https://github.com/SeismicScope/seismic-backend/commit/5992c57ed8acdbc26f3c8677d6123c08a651caa2))

# [1.1.0](https://github.com/SeismicScope/seismic-backend/compare/v1.0.0...v1.1.0) (2026-02-27)

### Features

- **map-points:** increase zoom limit for level 4 and below from 50k to 70k ([e837fc0](https://github.com/SeismicScope/seismic-backend/commit/e837fc09b01607684703e82a5dc71d2debfefe13))

# 1.0.0 (2026-02-20)

### Features

- add releases ([8a0443d](https://github.com/SeismicScope/seismic-backend/commit/8a0443dd652570b3679c0d926191042d394c4161))
- add releases ([35ee8e8](https://github.com/SeismicScope/seismic-backend/commit/35ee8e816950fd52ebf2b922cc3f8d4eff6bfc82))
