              {/* Widget overlay toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="show-widget">Show widget overlay</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable the floating widget.
                  </p>
                </div>
                <Switch
                  id="show-widget"
                  checked={config.showWidget}
                  onCheckedChange={(checked) => {
                    void updateConfig({ showWidget: checked });
                    if (checked) {
                      void switchToWidget();
                    } else {
                      void switchToSettings();
                    }
                  }}
                />
              </div>
