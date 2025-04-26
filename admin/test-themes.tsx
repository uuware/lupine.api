import {
  FloatWindow,
  NotificationMessage,
  notificationColorFromValue,
  PopupMenuWithButton,
  PopupMenuWithLabel,
  ToggleSwitch,
  ToggleSwitchSize,
  ModalWindow,
  MessageBox,
  MessageBoxButtonProps,
  NotificationColor,
  SelectWithTitle,
  InputWithTitle,
  Spinner01,
  Spinner02,
  SpinnerSize,
  Spinner03,
} from 'lupine.js';

const TestTextFontSize = () => {
  return (
    <div>
      <div class='page-title bold mb-s'>This is the page title (class=page-title, h2)</div>
      <div class='page-subtitle mb-s'>Subtitle (class=page-subtitle, h3-5)</div>
      <div class='h3 bold mb-s'>Paragraph title 1, H3 bold, sample text</div>
      <div class='h3-5 bold mb-s'>Paragraph title 2, H3-5 bold, sample text</div>
      <div class='h4 bold mb-s'>Paragraph title 3, H4 bold, sample text</div>
      <div class='h4-5 bold mb-s'>Paragraph title 4, H4-5 bold, sample text</div>
      <div class='h5 bold mb-s'>Paragraph title 5, H5 bold, sample text</div>
      <div class='page-paragraph mb-s'>Paragraph, text (class=page-paragraph, h4)</div>
      <div class='page-paragraph-s mb-s'>Smaller paragraph, text (class=page-paragraph, h5)</div>
      <div class='h1-l mb-s'>H1 large (h1-l), sample text</div>
      <h1 class='mb-s'>H1 text, sample text</h1>
      <h2 class='mb-s'>H2 text, sample text</h2>
      <h3 class='mb-s'>H3 text, sample text</h3>
      <h4 class='mb-s'>H4 text, sample text</h4>
      <h5 class='mb-s'>H5 text, sample text</h5>
      <h6 class='mb-s'>H6 text, sample text</h6>
      <div class='h6-s mb-s'>H6 small (h6-s), sample text</div>
    </div>
  );
};

const TestColors = () => {
  return (
    <div>
      <div class='success-text mb-s'>Success color</div>
      <div class='info-text mb-s'>Information color</div>
      <div class='warning-text mb-s'>Warning color</div>
      <div class='error-text mb-s'>Alert color</div>
      <div class='success-bg mb-s'>Success background color</div>
      <div class='info-bg mb-s'>Information background color</div>
      <div class='warning-bg mb-s'>Warning background color</div>
      <div class='error-bg mb-s'>Alert background color</div>
    </div>
  );
};

const TestButtons = () => {
  const doModal = (closeWhenClickOutside: boolean) => {
    ModalWindow.show({
      title: 'Save Menu',
      buttons: ['Ok', 'Cancel'],
      closeWhenClickOutside,
      contentMinWidth: '50%',
      handleClicked: (index: number, close: () => void) => {
        close();
      },
      children: <div>test Modal</div>,
    });
  };

  const list: string[] = ['Success', 'Info', 'Warning', 'Alert', '', 'Permanent'];
  const handleSelected = (value: string) => {
    const level = notificationColorFromValue(value);
    const permanent = value === 'Permanent';
    NotificationMessage.sendMessage('Selected: ' + value, level, permanent);
  };

  return (
    <div>
      <div class='row-box mb-s'>
        <button class='button-base mr-m' onClick={() => doModal(true)}>
          Modal (close click outside)
        </button>
        <button class='button-base mr-m' onClick={() => doModal(false)}>
          Test Modal
        </button>
        <button class='button-base mr-m' onClick={() => NotificationMessage.sendMessage('Test Message.')}>
          Notice Message
        </button>
        <button
          class='button-base mr-m'
          onClick={() =>
            FloatWindow.show({
              title: 'Title',
              buttons: ['OK'],
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>This is float window (modal).</div>,
            })
          }
        >
          Float Window
        </button>
        <button
          class='button-base mr-m'
          onClick={() =>
            FloatWindow.show({
              title: 'Title',
              buttons: ['OK'],
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>This is float window (no modal).</div>,
              noModal: true,
            })
          }
        >
          Float Window (no modal)
        </button>
        <button
          class='button-base mr-m'
          onClick={() =>
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.YesNo,
              contentMinWidth: '200px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>YesNo dialog.</div>,
            })
          }
        >
          MessageBox
        </button>

        <button
          class='button-base mr-m'
          onClick={() => {
            const options = [
              { option: 'Option 1', value: '1' },
              { option: 'Option 2', value: '2', selected: true },
              { option: 'Option 3', value: '3' },
            ];
            const content = SelectWithTitle('Select an option', options, (option: string) => {
              NotificationMessage.sendMessage('You selected: ' + option, NotificationColor.Success);
            });
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.YesNo,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Select an option (Select)
        </button>

        <button
          class='button-base mr-m'
          onClick={() => {
            const options = [
              { option: 'Option 1', value: '1' },
              { option: 'Option 2', value: '2' },
              { option: 'Option 3', value: '3', selected: true },
            ];
            const content = SelectWithTitle(
              'Select an option',
              options,
              (option: string) => {
                NotificationMessage.sendMessage('You selected: ' + option, NotificationColor.Success);
              },
              3
            );
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.YesNo,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Select an option (List)
        </button>

        <button
          class='button-base mr-m'
          onClick={() => {
            const content = InputWithTitle('Enter a value', 'default value', (value: string) => {
              NotificationMessage.sendMessage('You entered: ' + value, NotificationColor.Success);
            });
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.YesNo,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Input a value
        </button>

        <button class='button-base mr-m' disabled={true}>
          Disabled Button
        </button>
        <PopupMenuWithButton
          label='Test PopupMenu'
          list={list}
          defaultValue={''}
          noUpdateValue={true}
          handleSelected={handleSelected}
        ></PopupMenuWithButton>
        <PopupMenuWithLabel
          label='Test PopupMenu'
          list={list}
          defaultValue={''}
          noUpdateValue={true}
          handleSelected={handleSelected}
        ></PopupMenuWithLabel>
      </div>

      <div class='row-box mb-s'>
        <input type='text' class='input-base input-ss' value='SmallSmall Input' />
        <button class='button-base button-ss'>SmallSmall Button</button>
      </div>
      <div class='row-box mb-s'>
        <input type='text' class='input-base input-s' value='Small Input' />
        <button class='button-base button-s'>Small Button</button>
      </div>
      <div class='row-box mb-s'>
        <input type='text' class='input-base' value='Standard Input' />
        <button class='button-base'>Standard Button</button>
      </div>
      <div class='row-box mb-s'>
        <input type='text' class='input-base input-l' value='Large Input' />
        <button class='button-base button-l'>Large Button</button>
      </div>
      <div class='row-box mb-s'>
        <input type='text' class='input-base input-ll' value='LargeLarge Input' />
        <button class='button-base button-ll'>LargeLarge Button</button>
      </div>
    </div>
  );
};

export const TestThemesPage = () => {
  return (
    <div>
      <div class='row-box mb-s'>
        <TestTextFontSize></TestTextFontSize>
        <TestColors></TestColors>
      </div>
      <TestButtons></TestButtons>
      <div class='p2'>
        <div class='row-box mb-s'>
          <div class='w6'>Menu Id:</div>
          <input type='text' class='input-base' placeholder='Placeholder' />
          <input type='text' class='input-base' value='Text value' />
        </div>
        <div class='row-box mb-s'>
          <div class='w6'>Readonly:</div>
          <input type='text' class='input-base' placeholder='Placeholder' readonly={true} />
          <input type='text' class='input-base' value='Text value' readonly={true} />
          <div class='disabled'>Div with disabled</div>
          <label class='disabled'>Label with disabled</label>
        </div>
        <div class='row-box mb-s'>
          <div class='w6'>Disabled:</div>
          <input type='text' class='input-base' placeholder='Placeholder' disabled={true} />
          <input type='text' class='input-base' value='Text value' disabled={true} />
          <div class='disabled'>Div with disabled</div>
          <label class='disabled'>Label with disabled</label>
        </div>
        <div class='row-box mt-s'>
          <div class='w6'>Target:</div>
          <select id='menutarget' class='input-base w20' size={1}>
            <option value='0'>Parent Window</option>
            <option value='1'>New Window</option>
          </select>
        </div>
        <div class='row-box mt-s'>
          <div class='w6'>Disabled:</div>
          <select id='menutarget' class='input-base w20' size={1} disabled={true}>
            <option value='0'>Parent Window</option>
            <option value='1'>New Window</option>
          </select>
        </div>
        <div class='row-box mt-s'>
          <div class='w6'>Radio box:</div>
          <input type='radio' id='itemtype1' name='itemtype' />
          <label for='itemtype1'>Text</label>
          <input type='radio' id='itemtype2' name='itemtype' checked />
          <label for='itemtype2'>Checked</label>
          {/* checkbox and radio don't have readonly attribute */}
          <input type='radio' id='itemtype24' name='itemtype_rc' disabled={true} />
          <label for='itemtype24' class='disabled'>
            Disabled
          </label>
          <input type='radio' id='itemtype24' name='itemtype_rc' checked disabled={true} />
          <label for='itemtype24' class='disabled'>
            Disabled checked
          </label>
        </div>
        <div class='row-box mt-s'>
          <div class='w6'>Check box:</div>
          <input type='checkbox' id='itemtype11' name='itemtype1' />
          <label for='itemtype11'>Text</label>
          <input type='checkbox' id='itemtype22' name='itemtype2' checked />
          <label for='itemtype22'>Checked</label>
          <input type='checkbox' id='itemtype_d' name='itemtype4' disabled={true} />
          <label for='itemtype_d' class='disabled'>
            Disabled
          </label>
          <input type='checkbox' id='itemtype_dc' name='itemtype4' checked disabled={true} />
          <label for='itemtype_dc' class='disabled'>
            Disabled checked
          </label>
        </div>
        <div class='row-box mt-s'>
          <ToggleSwitch checked={true} size={ToggleSwitchSize.Small} />
          <ToggleSwitch checked={false} size={ToggleSwitchSize.Small} />
          <ToggleSwitch checked={true} size={ToggleSwitchSize.Medium} />
          <ToggleSwitch checked={false} size={ToggleSwitchSize.Medium} />
          <ToggleSwitch checked={true} size={ToggleSwitchSize.Large} />
          <ToggleSwitch checked={false} size={ToggleSwitchSize.Large} />
        </div>
        <div class='row-box mt-s'>
          <Spinner01 size={SpinnerSize.Small} />
          <Spinner01 size={SpinnerSize.Medium} />
          <Spinner01 size={SpinnerSize.Large} />
          <Spinner01 size={SpinnerSize.LargeLarge} />
        </div>
        <div class='row-box mt-s'>
          <Spinner02 size={SpinnerSize.Small} />
          <Spinner02 size={SpinnerSize.Medium} />
          <Spinner02 size={SpinnerSize.Large} />
          <Spinner02 size={SpinnerSize.LargeLarge} />
        </div>
        <div class='row-box mt-s'>
          <Spinner03 size={SpinnerSize.Small} />
          <Spinner03 size={SpinnerSize.Medium} />
          <Spinner03 size={SpinnerSize.Large} />
          <Spinner03 size={SpinnerSize.LargeLarge} />
        </div>
        <div class='row-box mb-s'>
          <div class='row-box flex1'>
            <div class='list-box'>
              <select class='input-base w-100p h-100p list' id='menulist' size={8}>
                <option value='0	0	0	0	index.php?st_p1=&amp;st_p2=&amp;st_m1=home	Web No Coding Home'>
                  Web No Coding Home
                </option>
                <option>Help Home</option>
                <option>Beginners</option>
                <option>----for Beginners</option>
                <option>----Template</option>
              </select>
            </div>
          </div>
          <div class='row-box flex1'>
            <div class='list-box'>
              <select class='input-base w-100p h-100p list' id='menulist' size={8} disabled={true}>
                <option value='0	0	0	0	index.php?st_p1=&amp;st_p2=&amp;st_m1=home	Web No Coding Home'>Disabled</option>
                <option>Help Home</option>
                <option>Beginners</option>
                <option>----for Beginners</option>
                <option>----Template</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
