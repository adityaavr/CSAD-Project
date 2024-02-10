import React from "react";
import "gantt-task-react/dist/index.css";
import { ViewMode } from "gantt-task-react";

export const ViewSwitcher = ({
                                 onViewModeChange,
                                 onViewListChange,
                                 isChecked,
                                 activeView,
                             }) => {
    const isTabActive = (viewMode) => activeView === viewMode;

    return (
        <div className="ViewContainer space-x-4">
            <div className="tabs tabs-boxed">
                <a
                    role="tab"
                    className={`tab ${isTabActive(ViewMode.QuarterDay) ? 'tab-active' : ''}`}
                    onClick={() => {
                        onViewModeChange(ViewMode.QuarterDay);
                        // Update activeView immediately after view mode change
                        activeView !== ViewMode.QuarterDay && onViewListChange(ViewMode.QuarterDay);
                    }}
                >
                    Quarter of Day
                </a>
                <a
                    role="tab"
                    className={`tab ${isTabActive(ViewMode.HalfDay) ? 'tab-active' : ''}`}
                    onClick={() => {
                        onViewModeChange(ViewMode.HalfDay);
                        activeView !== ViewMode.HalfDay && onViewListChange(ViewMode.HalfDay);
                    }}
                >
                    Half of Day
                </a>
                <a
                    role="tab"
                    className={`tab ${isTabActive(ViewMode.Day) ? 'tab-active' : ''}`}
                    onClick={() => {
                        onViewModeChange(ViewMode.Day);
                        activeView !== ViewMode.Day && onViewListChange(ViewMode.Day);
                    }}
                >
                    Day
                </a>
                <a
                    role="tab"
                    className={`tab ${isTabActive(ViewMode.Week) ? 'tab-active' : ''}`}
                    onClick={() => {
                        onViewModeChange(ViewMode.Week);
                        activeView !== ViewMode.Week && onViewListChange(ViewMode.Week);
                    }}
                >
                    Week
                </a>
                <a
                    role="tab"
                    className={`tab ${isTabActive(ViewMode.Month) ? 'tab-active' : ''}`}
                    onClick={() => {
                        onViewModeChange(ViewMode.Month);
                        activeView !== ViewMode.Month && onViewListChange(ViewMode.Month);
                    }}
                >
                    Month
                </a>
            </div>

            <div className="form-control">
                <label className="label cursor-pointer">
                    <span className="label-text">Show Task List</span>
                    <input
                        type="checkbox"
                        className="checkbox checkbox-success"
                        defaultChecked={isChecked}
                        onClick={() => onViewListChange(!isChecked)}
                    />
                </label>
            </div>
        </div>
    );
};
