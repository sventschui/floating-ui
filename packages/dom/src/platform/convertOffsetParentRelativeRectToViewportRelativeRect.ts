import type {Elements, Rect, Strategy} from '@floating-ui/core';
import {createCoords} from '@floating-ui/utils';
import {
  getDocumentElement,
  getNodeName,
  getNodeScroll,
  isHTMLElement,
  isOverflowElement,
} from '@floating-ui/utils/dom';

import {getBoundingClientRect} from '../utils/getBoundingClientRect';
import {getScale} from './getScale';
import type {Platform} from '../types';
import {topLayer} from '../utils/topLayer';

export function convertOffsetParentRelativeRectToViewportRelativeRect(
  this: Platform,
  {
    elements,
    rect,
    offsetParent,
    strategy,
  }: {
    elements?: Elements;
    rect: Rect;
    offsetParent: Element | Window;
    strategy: Strategy;
  },
): Rect {
  const documentElement = getDocumentElement(offsetParent);
  const [isTopLayer] = elements ? topLayer(elements.floating) : [false];

  if (offsetParent === documentElement || isTopLayer) {
    return rect;
  }

  let scroll = {scrollLeft: 0, scrollTop: 0};
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);

  if (
    isOffsetParentAnElement ||
    (!isOffsetParentAnElement && strategy !== 'fixed')
  ) {
    if (
      getNodeName(offsetParent) !== 'body' ||
      isOverflowElement(documentElement)
    ) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }

  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y,
  };
}
