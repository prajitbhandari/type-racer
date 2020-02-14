class AddFieldNameToTable < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :text_area, :text
    add_column :users, :wpm, :integer
  end
end
