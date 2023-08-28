[![CI/CD](https://github.com/vertigis/workflow-form-elements-web/workflows/CI/CD/badge.svg)](https://github.com/vertigis/workflow-form-elements-web/actions)
[![npm](https://img.shields.io/npm/v/@vertigis/workflow-form-elements-web)](https://www.npmjs.com/package/@vertigis/workflow-form-elements-web)

This project contains [VertiGIS Studio Workflow](https://vertigisstudio.com/products/vertigis-studio-workflow/) form elements for use in [VertiGIS Studio Web](https://vertigisstudio.com/products/vertigis-studio-web/).

VertiGIS Studio Web is built using React components from the [@vertigis/web](https://www.npmjs.com/package/@vertigis/web) package. Those components are internally built using React components from the [@mui/material](https://www.npmjs.com/package/@mui/material) package.

This activity pack wraps specific React components from [@vertigis/web](https://www.npmjs.com/package/@vertigis/web) and exposes them as workflow form elements that can be included in workflows via [Custom Form Elements](https://docs.vertigisstudio.com/workflow/latest/help/Default.htm#wf5/help/form-elements/custom.htm#Custom_Form_Elements?TocPath=Forms%257CForm%2520Element%2520Reference%257CCustom%2520Form%2520Elements%257C_____0).

The following React components/form elements are supported:
- `Alert`
- `Avatar`
- `Button`
- `CheckboxList`
- `Chip`
- `CircularProgress`
- `DynamicIcon`
- `EditableTable`
- `IconButton`
- `LinearProgress`
- `Link`
- `List`
- `Pagination`
- `Slider`
- `Switch`
- `Tabs`
- `Table`
- `ToggleButton`
- `Typography`

## Requirements

### VertiGIS Studio Versions

These form elements are designed to work with VertiGIS Studio Web versions `5.18` and above.

## Usage
To use the Utility Network activities in [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/) you need to register an activity pack and then add the activities to a workflow.

### Register the Web Form Elements activity pack

1. Sign in to ArcGIS Online or Portal for ArcGIS
1. Go to **My Content**
1. Select **Add Item > An application**
    - Type: `Web Mapping`
    - Purpose: `Ready To Use`
    - API: `JavaScript`
    - URL: The URL to this activity pack manifest
        - Use https://unpkg.com/@vertigis/workflow-form-elements-web/activitypack.json for the latest version
        - Use https://unpkg.com/@vertigis/workflow-form-elements-web@1.0.0/activitypack.json for a specific version
        - Use https://localhost:5000/activitypack.json for a local development version
    - Title: Your desired title
    - Tags: Must include `geocortex-workflow-activity-pack`
1. Reload [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/)

### Use the Web Form Elements in a workflow

1. Add a `Display Form` activity to the workflow
1. Add a `Custom` form element to the form
1. Set the `Custom Type` property of the form element to be the desired form element type
   - For example, `Link`
1. Expand the `Events` section of the form element properties
1. Add a `load` event
1. Add a `Set Form Element Property` activity to the subworkflow
1. Set the `Property Name` input of the activity to be the name of the property you wish to set
   - For example, `href`
1. Set the `Property Value` input of the activity to be the name of the property you wish to set
   - For example, `https://placekitten.com/g/200/300`
1. Repeat steps 6 - 8 for each property you wish to set
   - See the source code of the form element for the available properties and their usage

## Development

This project was bootstrapped with the [VertiGIS Studio Workflow SDK](https://github.com/geocortex/vertigis-workflow-sdk). Before you can use your activity pack in the [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/), you will need to [register the activity pack](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview#register-the-activity-pack).

## Available Scripts

Inside the newly created project, you can run some built-in commands:

### `npm run generate`

Interactively generate a new activity or form element.

### `npm start`

Runs the project in development mode. Your activity pack will be available at [http://localhost:5000/main.js](http://localhost:5000/main.js). The HTTPS certificate of the development server is a self-signed certificate that web browsers will warn about. To work around this open [`https://localhost:5000/main.js`](https://localhost:5000/main.js) in a web browser and allow the invalid certificate as an exception. For creating a locally-trusted HTTPS certificate see the [Configuring a HTTPS Certificate](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#configuring-a-https-certificate) section on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/).

### `npm run build`

Builds the activity pack for production to the `build` folder. It optimizes the build for the best performance.

Your custom activity pack is now ready to be deployed!

See the [section about deployment](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#deployment) in the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/) for more information.

## Documentation

Find [further documentation on the SDK](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/) on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/)
