import React, { useContext } from "react";
import { Link } from "mfr-router";

export function Nav() {
    return (
        <nav className="navbar txt--small u-hide@android" aria-label="Main">
            {/*<turbo-frame src="/account/trial/callouts" links-target="top" id="account_trial_callout"></turbo-frame>*/}

            <div className="navbar__content">
                <div className="navbar__left">
                    <a
                        className="navbar__inbox btn btn--primary btn--icon btn--icon-back push_quarter--right"
                        href="/"
                    >
                        Imbox
                    </a>

                    <a
                        className="navbar__search search__input btn btn--borderless btn--icon btn--icon-search"
                        href="/search/new"
                    >
                        Search
                    </a>

                    <div
                        className="search"
                        data-controller="search"
                        data-search-show-class="search--has-results"
                        data-search-busy-class="search--busy"
                        data-search-empty-class="search--empty"
                        data-action="click@window->search#resetWhenOutside focusin@window->search#resetWhenOutside"
                        tabIndex="-1"
                    >
                        <div className="search__inner colorize-after-ink">
                            <form
                                data-search-target="form"
                                data-turbo-frame="search"
                                data-controller="form"
                                data-action="reset-&gt;search#reset input-&gt;form#debouncedSubmit submit-&gt;search#performSearch turbolinks:submit-end-&gt;search#openResults"
                                role="search"
                                action="/search"
                                acceptCharset="UTF-8"
                                data-remote="true"
                                method="get"
                            >
                                <input
                                    type="search"
                                    autoComplete="off"
                                    spellCheck="false"
                                    role="combobox"
                                    placeholder="Search"
                                    name="q"
                                    required={true}
                                    pattern=".*\w+.*"
                                    className="search__input input input--icon input--rounded input--full-width flex-item--grow"
                                    aria-autocomplete="list"
                                    aria-haspopup="listbox"
                                    aria-label="search"
                                    aria-controls="search"
                                    aria-required="false"
                                    aria-expanded="false"
                                    data-controller="hotkey combobox-group-polyfill combobox"
                                    data-action="invalid-&gt;form#suppressValidationMessage input-&gt;combobox#clearSelection input-&gt;search#resetWhenEmpty keydown-&gt;combobox#navigate input-&gt;combobox#resetWhenEmpty"
                                    data-hotkey="/,s"
                                    data-combobox-prevent-wrapping-value="true"
                                    data-combobox-selected-class="search-result--selected"
                                    data-search-target="input"
                                    data-combobox-group-polyfill-announcement-id-value="search_live_region"
                                />
                                <span
                                    className="u-for-screen-reader"
                                    id="search_live_region"
                                    aria-live="assertive"
                                />
                            </form>
                            {/*<turbo-frame role="listbox"*/}
                            {/*             className="search__results sheet search__results--has-trial-banner"*/}
                            {/*             aria-labelledby="search__results-heading" links-target="top" id="search">*/}
                            {/*    <span className="u-for-screen-reader" role="option" aria-disabled="true">No matches found</span>*/}
                            {/*</turbo-frame>*/}
                        </div>
                    </div>
                </div>

                <div className="u-relative">
                    <details
                        data-controller="popup-menu bridge--menu popup-picker"
                        data-action=" toggle-&gt;popup-picker#cancelOnClose toggle-&gt;popup-menu#update focusin@window-&gt;popup-menu#closeOnFocusOutside click@window-&gt;popup-menu#closeOnClickOutside reset-&gt;popup-menu#closeAndRestoreFocus"
                        data-popup-picker-filtering-class="popup-picker--filtering"
                        data-popup-picker-adding-class="popup-picker--adding"
                    >
                        <summary
                            className="navbar__item navbar__logo navbar__logo--open colorize-after-purple btn--focusable"
                            data-controller="hotkey"
                            data-action="click->bridge--menu#show toggle->popup-menu#update"
                            aria-haspopup="menu"
                            aria-label="Go to"
                            data-hotkey="h,Meta+j"
                        >
                            <a
                                data-turbo-frame="my_navigation"
                                data-popup-menu-target="link"
                                href="/my/navigation"
                            >
                                HEY
                            </a>
                        </summary>

                        {/*<turbo-frame id="my_navigation" role="menu" links-target="top"*/}
                        {/*             className="popup-menu popup-menu--padded popup-menu--centered popup-menu--tall navbar__menu navbar__menu--hey">*/}
                        {/*    <span className="u-for-screen-reader" role="menuitem" aria-disabled="true">Loading</span>*/}
                        {/*</turbo-frame>*/}
                    </details>
                </div>

                <div className="navbar__right">
                    <details
                        data-controller="popup-menu"
                        data-action="toggle-&gt;popup-menu#update focusin@window-&gt;popup-menu#closeOnFocusOutside click@window-&gt;popup-menu#closeOnClickOutside reset-&gt;popup-menu#close keydown-&gt;popup-menu#navigate"
                        id="my-stuff-menu"
                    >
                        <summary
                            className="u-full-height btn--focusable"
                            role="button"
                        >
                            <div className="navbar__me">
                                <span className="navbar__purpose account-purpose account-purpose--all">
                                    Showing all accounts
                                </span>

                                <span className="navbar__me-label push_half--right">
                                    Me
                                </span>
                                <img
                                    src="https://production.haystack-assets.com/contacts/avatars/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik16TXdOVEkyTXpVPSIsImV4cCI6bnVsbCwicHVyIjoiY29udGFjdC9hdmF0YXIifX0=--b69b82c31cb72e0d6202608e877548b5ae4a83759d692879c3cd10da0d536b6b?v=20210203075359000000-271987607"
                                    alt="Shane Osbourne"
                                    title="Shane Osbourne &lt;shane.osbourne@hey.com&gt;"
                                    width="50"
                                    height="50"
                                    loading="lazy"
                                    decoding="async"
                                    className="navbar__avatar avatar"
                                    aria-hidden="true"
                                />
                                <Link
                                    to={"/me"}
                                    className="undecorated push_half--right"
                                    data-turbo-frame="my_stuff"
                                    data-popup-menu-target="link"
                                    href="/me"
                                >
                                    Settings
                                </Link>
                            </div>
                        </summary>

                        {/*<turbo-frame id="my_stuff" role="menu" links-target="top"*/}
                        {/*             className="popup-menu navbar__menu navbar__menu--me"*/}
                        {/*             data-controller="disable-on-mobile">*/}
                        {/*    <span className="u-for-screen-reader" role="menuitem" aria-disabled="true">Loading</span>*/}
                        {/*</turbo-frame>*/}
                    </details>
                </div>
            </div>

            <div className="help u-show@desktop">
                <div className="help__wrapper">
                    <details
                        data-controller="popup-menu"
                        data-action="toggle-&gt;popup-menu#update focusin@window-&gt;popup-menu#closeOnFocusOutside click@window-&gt;popup-menu#closeOnClickOutside reset-&gt;popup-menu#close keydown-&gt;popup-menu#navigate"
                        id="kbd-shortcuts"
                        className="kbd-shortcuts"
                    >
                        <summary
                            aria-haspopup="true"
                            aria-label="Keyboard shortcut reference"
                            className="btn--plain kbd-shortcuts__button u-display-n u-visibility-hidden"
                            data-controller="hotkey"
                            data-hotkey="Shift ?"
                        >
                            <span className="help__button help__button--shortcuts btn btn--icon-round btn--icon-keyboard btn--subtle">
                                Keyboard shortcuts
                            </span>
                        </summary>

                        <div className="popup-menu popup-menu--right kbd-shortcuts__popup">
                            <div className="push_half--sides">
                                <h3 className="hdg hdg--large flush--ends">
                                    Keyboard Shortcuts
                                </h3>
                            </div>

                            <div className="push_half--sides kbd-shortcuts__content">
                                <div className="kbd-shortcuts__column">
                                    <div>
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            Navigation
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Imbox <kbd>1</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            The Feed <kbd>2</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Paper Trail <kbd>3</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Reply Later <kbd>4</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Set Aside <kbd>5</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            All Files <kbd>6</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Search <kbd>s</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            HEY menu <kbd>h</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Show shortcuts <kbd>?</kbd>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            Search
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Next result <kbd>▾</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Previous result <kbd>▴</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Open result <kbd>Enter</kbd>
                                        </div>
                                    </div>
                                </div>
                                <div className="kbd-shortcuts__column kbd-shortcuts__column--contextual">
                                    <div className="kbd-shortcuts-group kbd-shortcuts-group--screener">
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            The Screener
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Next contact{" "}
                                            <span>
                                                <kbd>j</kbd> or <kbd>▾</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Previous contact{" "}
                                            <span>
                                                <kbd>k</kbd> or <kbd>▴</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Toggle email preview{" "}
                                            <kbd>Enter</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Screen In <kbd>y</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Screen Out <kbd>n</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Screen in to The Feed <kbd>d</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Screen in to Paper Trail{" "}
                                            <kbd>p</kbd>
                                        </div>
                                    </div>
                                    <div className="kbd-shortcuts-group kbd-shortcuts-group--imbox">
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            Imbox
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Select thread <kbd>X</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Next thread{" "}
                                            <span>
                                                <kbd>j</kbd> or <kbd>▾</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Previous thread{" "}
                                            <span>
                                                <kbd>k</kbd> or <kbd>▴</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Open thread <kbd>Enter</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Focus actions menu <kbd>;</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Compose message{" "}
                                            <span>
                                                <kbd>c</kbd> or <kbd>w</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            The Screener <kbd>=</kbd>
                                        </div>
                                    </div>
                                    <div className="kbd-shortcuts-group kbd-shortcuts-group--trailbox">
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            Paper Trail
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Select thread <kbd>X</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Next thread{" "}
                                            <span>
                                                <kbd>j</kbd> or <kbd>▾</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Previous thread{" "}
                                            <span>
                                                <kbd>k</kbd> or <kbd>▴</kbd>
                                            </span>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Open thread <kbd>Enter</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Focus actions menu <kbd>;</kbd>
                                        </div>
                                    </div>
                                    <div className="kbd-shortcuts-group kbd-shortcuts-group--topic">
                                        <h4 className="hdg hdg--caps hdg--x-small push--top push_half--bottom">
                                            Threads
                                        </h4>
                                        <div className="kbd-shortcut">
                                            Reply Now <kbd>r</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Reply Later <kbd>l</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Set Aside <kbd>a</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Forward <kbd>f</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Label <kbd>b</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Move <kbd>v</kbd>
                                        </div>
                                        <div className="kbd-shortcut">
                                            Trash <kbd>t</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </details>
                    <details
                        data-controller="popup-menu"
                        data-action="toggle-&gt;popup-menu#update focusin@window-&gt;popup-menu#closeOnFocusOutside click@window-&gt;popup-menu#closeOnClickOutside reset-&gt;popup-menu#close keydown-&gt;popup-menu#navigate"
                        id="help-menu"
                    >
                        <summary className="help__button btn btn--icon-round btn--icon-help btn--subtle btn--focusable">
                            <span className="push_half--right">Help menu</span>
                        </summary>

                        <div
                            className="popup-menu popup-menu--bottom popup-menu--right push_double--bottom push--right"
                            role="menu"
                            links-target="top"
                            data-controller="disable-on-mobile"
                        >
                            <h3 className="action-group__title push_half--top">
                                HEY Help
                            </h3>
                            <div className="action-group action-group--surface">
                                <div
                                    role="option"
                                    className="action-group__item"
                                    data-name="faqs"
                                >
                                    <a
                                        target="_blank"
                                        className="action-group__action--help-circle action-group__action"
                                        role="menuitem"
                                        data-popup-menu-target="item"
                                        data-bridge--menu-target="item"
                                        data-bridge-group="default"
                                        data-bridge-style="default"
                                        data-bridge-selected="false"
                                        data-bridge-icon-name="help-circle"
                                        data-bridge-icon-android-url="https://production.haystack-assets.com/assets/icons/help-circle-78f7771956be6d034efda33691f3f8b98028012269f4b9995ca5070ac63143a0.svg"
                                        data-bridge-icon-ios-url="https://production.haystack-assets.com/assets/icons/ios/help-circle-0a6252e9f5920b963907f2b07720e20c1c57c306307c46991efeb3b1ae2582d7.png"
                                        href="https://hey.com/faqs"
                                    >
                                        FAQs
                                    </a>
                                </div>
                                <div className="action-group__item ">
                                    <button
                                        name="button"
                                        type="submit"
                                        className="action-group__action--keyboard action-group__action "
                                        role="menuitem"
                                        data-popup-menu-target="item"
                                        data-bridge--menu-target="item"
                                        data-bridge-group="default"
                                        data-bridge-style="default"
                                        data-bridge-selected="false"
                                        data-bridge-icon-name="keyboard"
                                        data-bridge-icon-android-url="https://production.haystack-assets.com/assets/icons/keyboard-c102e9e3fe7babd69051926f1fa6d5d92898753e812b13f406b5e8e6952d78c5.svg"
                                        data-bridge-icon-ios-url="https://production.haystack-assets.com/assets/icons/ios/keyboard-e625247d687bc0fe7db7e5f95b93fe51a0e1143667e164e7d25ef7ee10a56426.png"
                                        data-controller="outlet"
                                        data-outlet-element-id-value="kbd-shortcuts"
                                        data-action="outlet#open popup-menu#close"
                                    >
                                        <span>Keyboard Shortcuts</span>
                                    </button>
                                </div>
                                <div
                                    role="option"
                                    className="action-group__item"
                                    data-name="contact support"
                                >
                                    <a
                                        className="action-group__action--add-email action-group__action"
                                        role="menuitem"
                                        data-popup-menu-target="item"
                                        data-bridge--menu-target="item"
                                        data-bridge-group="default"
                                        data-bridge-style="default"
                                        data-bridge-selected="false"
                                        data-bridge-icon-name="add-email"
                                        data-bridge-icon-android-url="https://production.haystack-assets.com/assets/icons/add-email-59fc83515c0d69cb200b8f01515b5783bd9dd385585f651d880e29f537ed9126.svg"
                                        data-bridge-icon-ios-url="https://production.haystack-assets.com/assets/icons/ios/add-email-980c7335bfe30a012381123b7f32b0a43284ebfc8b2c7612df71f67b284082c4.png"
                                        href="/messages/support/new"
                                    >
                                        Contact Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            <a
                data-controller="hotkey"
                data-hotkey="Control+1,1"
                hidden="hidden"
                href="/"
            >
                Imbox
            </a>
            <a
                data-controller="hotkey"
                data-hotkey="Control+2,2"
                hidden="hidden"
                href="/feedbox"
            >
                The Feed
            </a>
            <a
                data-controller="hotkey"
                data-hotkey="Control+3,3"
                hidden="hidden"
                href="/paper_trail"
            >
                Paper Trail
            </a>
            <a
                data-controller="hotkey"
                data-hotkey="Control+4,4"
                hidden="hidden"
                href="/reply_later"
            >
                Reply Later
            </a>
            <a
                data-controller="hotkey"
                data-hotkey="Control+5,5"
                hidden="hidden"
                href="/set_aside"
            >
                Set Aside
            </a>
            <a
                data-controller="hotkey"
                data-hotkey="Control+6,6"
                hidden="hidden"
                href="/attachments"
            >
                All Files
            </a>
        </nav>
    );
}
