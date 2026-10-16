export const NODE_TITLE_GLYPH = { idle: "#A1C4FA", active: "#D6E4FF" };

const BOX = 2;
const SIDE = 28;
const RADIUS = 8;
const STROKE = 2;
const STROKE_IDLE = "#76A4F6";
const STROKE_ACTIVE = "#A1C4FA";
const FILL_IDLE_TOP = "#3A486A";
const FILL_IDLE_BOTTOM = "#35405D";
const FILL_ACTIVE_TOP = "#455880";
const FILL_ACTIVE_BOTTOM = "#3E4C72";
const GLYPH_FONT = "bold 24px system-ui";
const GLYPH_X = 16;
const GLYPH_Y = 19;
const GEAR_CENTER = 16;
const GEAR_SCALE = 0.75;
const GEAR_VIEW = 12;
const GEAR_BODY_D = "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z";
const ACTION_CENTER = 16;
const ACTION_VIEW = 12;
const ACTION_SCALE = 0.75;
const ACTION_PATH_DATA = {
    restore: "M1 4 1 10 7 10 M23 4 23 10 17 10 M20.49 15a9 9 0 1 1-2.12-9.36L23 10",
    clear: "M20 4 4 20 M4 4 20 20",
};

export const NODE_TITLE_ACTION_TINTS = {
    restore: {
        top: "#2F6B4B",
        bottom: "#28603F",
        topActive: "#3A7D59",
        bottomActive: "#31704B",
        stroke: "#4ADE80",
        strokeActive: "#86EFAC",
        glyph: "#BBF7D0",
        glyphActive: "#DCFCE7",
    },
    clear: {
        top: "#6E3139",
        bottom: "#602B33",
        topActive: "#823C45",
        bottomActive: "#73343D",
        stroke: "#F87171",
        strokeActive: "#FCA5A5",
        glyph: "#FECACA",
        glyphActive: "#FEE2E2",
    },
    template: {
        top: "#414B80",
        bottom: "#3A4374",
        topActive: "#4E5994",
        bottomActive: "#454F86",
        stroke: "#8FA2F2",
        strokeActive: "#B4C2F8",
        glyph: "#D5DDFF",
        glyphActive: "#EAEEFF",
    },
};

const CHIP_DEFAULT = {
    top: FILL_IDLE_TOP,
    bottom: FILL_IDLE_BOTTOM,
    topActive: FILL_ACTIVE_TOP,
    bottomActive: FILL_ACTIVE_BOTTOM,
    stroke: STROKE_IDLE,
    strokeActive: STROKE_ACTIVE,
};

export function drawNodeTitleChip(ctx, active, tint) {
    const palette = tint || CHIP_DEFAULT;
    const grad = ctx.createLinearGradient(BOX, BOX, BOX + SIDE, BOX + SIDE);
    grad.addColorStop(0, active ? palette.topActive : palette.top);
    grad.addColorStop(1, active ? palette.bottomActive : palette.bottom);
    ctx.beginPath();
    ctx.roundRect(BOX, BOX, SIDE, SIDE, RADIUS);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = active ? palette.strokeActive : palette.stroke;
    ctx.lineWidth = STROKE;
    ctx.stroke();
}

export function drawNodeHelpButton(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.font = GLYPH_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.fillText("?", GLYPH_X, GLYPH_Y);
}

let _gearPath = null;

function gearPath() {
    if (_gearPath) return _gearPath;
    const path = new Path2D();
    path.arc(GEAR_VIEW, GEAR_VIEW, 3, 0, Math.PI * 2);
    path.addPath(new Path2D(GEAR_BODY_D));
    _gearPath = path;
    return path;
}

export function drawNodeSettingsButton(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.save();
    ctx.translate(GEAR_CENTER, GEAR_CENTER);
    ctx.scale(GEAR_SCALE, GEAR_SCALE);
    ctx.translate(-GEAR_VIEW, -GEAR_VIEW);
    ctx.strokeStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = STROKE / GEAR_SCALE;
    ctx.stroke(gearPath());
    ctx.restore();
}

const _actionPaths = new Map();

function actionPath(kind) {
    if (_actionPaths.has(kind)) return _actionPaths.get(kind);
    let path;
    if (kind === "template") {
        path = new Path2D();
        path.roundRect(3, 3, 18, 18, 2);
        path.moveTo(3, 9);
        path.lineTo(21, 9);
        path.moveTo(9, 21);
        path.lineTo(9, 9);
    } else {
        path = new Path2D(ACTION_PATH_DATA[kind] || "");
    }
    _actionPaths.set(kind, path);
    return path;
}

export function drawNodeTitleAction(ctx, kind, active) {
    const tint = NODE_TITLE_ACTION_TINTS[kind];
    if (!tint) return;
    drawNodeTitleChip(ctx, active, tint);
    ctx.save();
    ctx.translate(ACTION_CENTER, ACTION_CENTER);
    ctx.scale(ACTION_SCALE, ACTION_SCALE);
    ctx.translate(-ACTION_VIEW, -ACTION_VIEW);
    ctx.strokeStyle = active ? tint.glyphActive : tint.glyph;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = STROKE / ACTION_SCALE;
    ctx.stroke(actionPath(kind));
    ctx.restore();
}
