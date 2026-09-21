# Literary map geography review

Reviewed September 21, 2026 against catalog baseline `551f95f49b3228fd87fad4bbb5f2ce82e0c4d9d3`. The complete 43-entry record is in [literary_map_geography.json](literary_map_geography.json), with original and corrected coordinates, precision notes and primary-source queries.

The owner reported world maps without NYC pins for Central Park in *The Custom of the Country*, Park Row and East Broadway. The original Embed helper ignored catalog coordinates and depended on free-text place resolution. A supported browser reproduced East Broadway at `ll=0,0` / zoom 1. Full Plus Codes, an explicit coordinate center and matching keyless external destinations repaired actual Google pin rendering for all three cases; Washington Square also passed a landmark regression. The parent observed real pins and nearby streets at 1363×936, including switching between uptown and downtown selections. These four manual rendering checks are separate from the 43-entry editorial geography review and automated URL-contract checks.

NYC DCP LION street nodes and centerlines identify current intersections and street segments. NYC Parks polygons establish park membership; official PAD address data and NTA boundaries support institution and neighborhood representatives. This review corrected 16 coordinates and retained 27 representative points. Coordinate precision does not identify a fictional building, vanished arbor, historical shoreline or exact scene. Existing literary passages, locators, covers and the 19-work / 43-passage / 40-place catalog are preserved.

## Corrected points

Coordinates are latitude, longitude (WGS84). See the JSON evidence for node, street-segment or polygon identifiers and directly reproducible source URLs.

| Entry | Previous coordinate | Reviewed coordinate | Disposition |
| --- | --- | --- | --- |
| quicksand-st-nicholas-park | 40.817, -73.9506 | 40.817, -73.9495 | Corrected representative point |
| mirth-madison-avenue | 40.7554, -73.9762 | 40.754737, -73.9778763 | Corrected representative point |
| beautiful-fifth-avenue | 40.759, -73.9765 | 40.759795, -73.9762901 | Corrected representative point |
| levinsky-state-street | 40.7033, -74.0143 | 40.7045573, -74.0142907 | Corrected representative point |
| levinsky-park-row | 40.7125, -74.0075 | 40.7120167, -74.0060706 | Corrected representative point |
| levinsky-east-broadway | 40.7137, -73.9875 | 40.7143203, -73.9871677 | Corrected representative point |
| levinsky-grand-street | 40.7152, -73.9896 | 40.7167169, -73.9891561 | Corrected representative point |
| levinsky-canal-street | 40.716, -73.9972 | 40.7149069, -73.9918913 | Corrected representative point |
| yekl-suffolk-street | 40.7172, -73.9851 | 40.7180111, -73.986587 | Corrected representative point |
| hungry-west-29th-street | 40.7488, -73.9927 | 40.7478632, -73.9929107 | Corrected representative point |
| maggie-bowery | 40.7221, -73.9938 | 40.7241447, -73.9926047 | Corrected representative point |
| voice-eighth-avenue-48th | 40.761, -73.9878 | 40.7610456, -73.9870166 | Corrected representative point |
| custom-west-72nd-street | 40.7766, -73.9789 | 40.776228, -73.9759566 | Corrected representative point |
| custom-central-park | 40.7751, -73.9768 | 40.77525, -73.97605 | Corrected representative point |
| carrie-west-13th-street | 40.737, -73.9995 | 40.7372747, -73.9987637 | Corrected representative point |
| carrie-warren-hudson | 40.7149, -74.0099 | 40.7149592, -74.0096912 | Approximate historical reference |

Warren and Hudson do not intersect in the current LION street network. The novel's wording remains intact; the pin at nearby Warren Street and West Broadway is explicitly an orientation point, not a verified historical corner or property transaction. West 13th Street uses the midpoint of the stated block west of Sixth Avenue, without identifying the fictional flat. Both St. Nicholas Park and the western Central Park representative were moved inside the official park polygons.

The Battery and Spuyten Duyvil remain broad waterfront or approach references; modern ownership and land polygons do not reconstruct their historical locations. The existing Fulton Ferry historical reference returned HTTP 403 during this audit, so its broad waterfront association was retained without claiming a new precise survey.

## Sources and maintenance

- [NYC DCP LION streets](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/ArcGIS/rest/services/LION/FeatureServer)
- [NYC DCP LION nodes](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/ArcGIS/rest/services/LION_Node/FeatureServer)
- [NYC DCP open-space polygons](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/ArcGIS/rest/services/v_GFT_Open_Spaces/FeatureServer/0)
- [NYC DCP GeoSearch](https://geosearch.planninglabs.nyc/v2/search)
- [2020 NYC neighborhood tabulation areas](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/ArcGIS/rest/services/2020_NTAs/FeatureServer/0)

Use the coordinate's stated representative scope when editing or adding a place. Regenerate its full `plus_code` offline as described in [google_maps.md](google_maps.md). Unit tests compare an independent decoder with Google's official fixtures and verify every catalog coordinate lies in its code cell. Browser contract tests traverse all 43 selections and compare the iframe marker, center and external destination. Intercepted CI map requests do not prove real Google rendering; repeat actual Google checks when changing the integration.
