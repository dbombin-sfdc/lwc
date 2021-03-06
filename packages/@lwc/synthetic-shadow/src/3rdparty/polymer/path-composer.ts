/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { isNull } from '@lwc/shared';
import { getOwnerDocument } from '../../shared/utils';

export function pathComposer(startNode: EventTarget, composed: boolean): EventTarget[] {
    const composedPath: EventTarget[] = [];
    let current: EventTarget | null = startNode;
    const startRoot: Window | Node =
        startNode instanceof Window ? startNode : (startNode as Node).getRootNode();
    while (!isNull(current)) {
        composedPath.push(current);

        if (current instanceof Element) {
            // Text also implements the Slottable mixin but is not an EventTarget, nor a ParentNode,
            // which means it is safe to only look for Elements here.
            const assignedSlot: HTMLSlotElement | null = current.assignedSlot;
            if (!isNull(assignedSlot)) {
                current = assignedSlot;
            } else {
                current = current.parentNode;
            }
        } else if (current instanceof ShadowRoot && (composed || current !== startRoot)) {
            current = current.host;
        } else if (current instanceof Node) {
            current = current.parentNode;
        } else {
            // could be Window
            current = null;
        }
    }
    let doc: Document;
    if (startNode instanceof Window) {
        doc = startNode.document;
    } else {
        doc = getOwnerDocument(startNode as Node);
    }
    // event composedPath includes window when startNode's ownerRoot is document
    if ((composedPath[composedPath.length - 1] as any) === doc) {
        composedPath.push(window);
    }
    return composedPath;
}
