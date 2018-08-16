Imports DevExpress.XtraGrid.Columns
Imports System.Reflection
Imports DevExpress.Utils
Imports DevExpress.XtraGrid.Views.Grid.ViewInfo
Imports DevExpress.Skins
Imports DevExpress.LookAndFeel
Imports System.Linq
Imports System.Management
Imports DevExpress.XtraEditors

Public Class _ProductionPlaning_Dialy1
    Private _helper As AutoHeightHelper = Nothing
    Private _ProductionPlaning_VIEW As _ProductionPlaning_Dialy
    Private SortField As String = ""

    Private _IsTVMode As Boolean = False
    Private _WS As Object
    Private _SwitchReview As Integer = 0
    Private _TotalMonth As DataTable
    '
    Public Property IsTVMode As Boolean
        Get
            Return _IsTVMode
        End Get
        Set(value As Boolean)
            If value Then
                NgayThang.Enabled = False
                ScrollView.Enabled = True
            End If
            _IsTVMode = value
        End Set
    End Property
    Public WriteOnly Property WS As Object
        Set(value As Object)
            _WS = value
        End Set
    End Property
#Region "TIMER"

    Private Sub CrossHairTimer_Tick(sender As Object, e As System.EventArgs) Handles CrossHairTimer.Tick
        CrossHairTimer.Enabled = False
        Try
            Dim offsetX As Integer = dogHair_Left()
            If Not (offsetX = 0 AndAlso Me.Height = 0) Then
                CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
            End If
            '
            REAL_DATA()
            _SwitchReview += 1
            If _SwitchReview = Integer.MaxValue Then _SwitchReview = 0
            '
            CrossHairTimer.Tag = Now
            '
        Catch ex As Exception
            '
        End Try
        CrossHairTimer.Enabled = True
    End Sub
    Private Sub TrackingDayChanged_Tick(sender As System.Object, e As System.EventArgs) Handles TrackingDayChanged.Tick
        If NgayThang.EditValue <> Now.Date Then '--- thay doi ngay
            NgayThang.EditValue = Now.Date
        End If
    End Sub
    Private Sub ScrollView_Tick(sender As Object, e As System.EventArgs) Handles ScrollView.Tick
        '
        If ScrollView.Tag = 0 Then
            '
            colNotes_Width()
            '
            GroupBox5.Refresh()
            '
            Application.DoEvents()
            '
            ScrollView.Tag = 1
        End If
        '
        If Not _IsTVMode Then
            ScrollView.Enabled = False
            gridControl1.BringToFront()
            gridControl1.Dock = DockStyle.Fill
            extendTV.BringToFront()
            CrossHair.BringToFront()
        Else
            If gridControl1.Height > Me.Height Then
                If gridControl1.Location.Y <= Me.Height - gridControl1.Height Then
                    ScrollView.Tag = 2
                ElseIf gridControl1.Location.Y >= GroupBox5.Height Then
                    ScrollView.Tag = 1
                End If
                Dim offset As Integer = 1
                If ScrollView.Tag = 2 Then offset = -1
                gridControl1.Location = New Point(gridControl1.Location.X, gridControl1.Location.Y - offset)
            Else
                gridControl1.BringToFront()
                gridControl1.Dock = DockStyle.Fill
                extendTV.BringToFront()
                CrossHair.BringToFront()
            End If
        End If
        '
        'Dim viewInfo As GridViewInfo = CType(gridView1.GetViewInfo(), GridViewInfo)
        'Dim fi As FieldInfo = GetType(GridView).GetField("scrollInfo", BindingFlags.Instance Or BindingFlags.NonPublic)
        'Dim scrollInfo As DevExpress.XtraGrid.Scrolling.ScrollInfo = DirectCast(fi.GetValue(gridView1), DevExpress.XtraGrid.Scrolling.ScrollInfo)
        'If scrollInfo.VScrollVisible Then
        '    vScrollBar.Value += 1
        '    gridView1.LayoutChanged()
        '    '
        'End If


    End Sub

    Private Sub colNotes_Width()
        If _IsTVMode Then
            Dim _W As Integer = gridView1.IndicatorWidth
            For i As Integer = 0 To gridView1.Columns.Count - 2
                _W += gridView1.Columns(i).VisibleWidth
            Next
            If _W < Me.Width Then
                gridView1.Columns("Notes").Width = Me.Width - _W - 5
            Else
                gridView1.Columns("Notes").Width = 0
            End If
            gridView1.LayoutChanged()
        End If
    End Sub

#End Region

#Region "DOG HAIR LINE"
    Private CrossHair As ZigzagControl
    Private Sub Init_CrossHair()
        Dim offsetX As Integer = dogHair_Left()
        CrossHair = New ZigzagControl(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)}, 1)
        CrossHair.BackColor = Color.HotPink
        Me.Controls.Add(CrossHair)
        extendTV.BringToFront()
        CrossHair.BringToFront()
    End Sub
    Private Sub Update_CrossHair()
        If CrossHair IsNot Nothing Then
            If DigitalDisplayControl1.Tag = "1" Then
                CrossHair.Visible = True
                Dim offsetX As Integer = dogHair_Left()
                CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
                CrossHairTimer.Enabled = True
            Else
                CrossHair.Visible = False
                CrossHairTimer.Enabled = False
            End If
        End If
    End Sub
    Private Function dogHair_Left() As Integer
        Dim _offset As Decimal = DigitalDisplayControl1.Width / 60
        Dim Val As Integer = DigitalDisplayControl1.Left + _offset * (CInt(DateDiff(DateInterval.Minute, CDate(Now.ToString("yyyy/MM/dd HH:00")), CDate(Now.ToString("yyyy/MM/dd HH:mm")))) + 1)
        If Val < 0 Then Val = 0
        Return Val
    End Function
#End Region

#Region "FORM"
    Private Sub NgayThang_EditValueChanged(sender As Object, e As System.EventArgs)
        Init(NgayThang.DateTime.Day)
    End Sub
    Private Sub _ProductionPlaning_Dialy1_HandleDestroyed(sender As Object, e As System.EventArgs) Handles Me.HandleDestroyed
        Try
            _helper.DisableColumnPanelAutoHeight()
            If _ProductionPlaning_VIEW IsNot Nothing AndAlso Not _ProductionPlaning_VIEW.IsDisposed Then _ProductionPlaning_VIEW.Close()
        Catch ex As Exception
        End Try
    End Sub
    Private Sub _ProductionPlaning_Dialy1_Load(sender As Object, e As System.EventArgs) Handles Me.Load
        '
        Try
            RefreshView_ItemClick(Nothing, Nothing)
            Init_CrossHair()
            '
            customResTotal.ControlType = GetType(PPInfo)
            customRepositoryItem1.ControlType = GetType(PPInfo)
            DirectCast(customRepositoryItem1.DrawControl, PPInfo).ScaleFont = 2
            '
            NgayThang.EditValue = Now.Date
            Init(1)
            '
            AddHandler Me.Resize, AddressOf _ProductionPlaning_Dialy1_Resize
            '
        Catch ex As Exception
            Dim err As Integer = 0
        End Try

    End Sub
    Private Sub _ProductionPlaning_Dialy1_Resize(sender As Object, e As System.EventArgs)
        Dim offsetX As Integer = dogHair_Left()
        If Not (offsetX = 0 AndAlso Me.Height = 0) Then
            CrossHair.dog_Resize(New Point() {New Point(offsetX, 0), New Point(offsetX, Me.Height)})
        End If
    End Sub
#End Region

#Region "GRID CONTROL1"

    Private Function LOAD_KETQUA(ByVal TestParam As Integer) As DataTable
        Dim DS As DataTable = Nothing
        If Not _IsTVMode Then
            DS = FrameWork.dbObj.GetDT("Select T.TaskID,D.KetQua,T.RowID From PPline_Data As D Inner Join TaskDef As T ON D.TaskID=T.RowID Where T.TaskID<>N'0000' And T.Active=1 And D.EachDate='" & NgayThang.DateTime.ToString("yyyy/MM/dd") & "'")
            Me.Tag = DS.Copy
        Else
            DS = _WS.Tag
        End If
        Return DS
    End Function

    Private Sub Init(ByVal TestParam As Integer)
        '
        CrossHairTimer.Tag = Now
        '
        RemoveHandler NgayThang.EditValueChanged, AddressOf NgayThang_EditValueChanged
        TrackingDayChanged.Enabled = False
        '
        gridView1.BeginDataUpdate()
        gridView1.Columns.Clear()
        '
        Dim DS As DataTable = LOAD_KETQUA(TestParam)
        Dim TuGio As DateTime = NgayThang.DateTime.ToString("yyyy/MM/dd") & " 7:00"
        Dim DenGio As DateTime = NgayThang.DateTime.ToString("yyyy/MM/dd") & " 22:00"
        '
        Dim DT As DataTable = DS.DefaultView.ToTable(True, New String() {"TaskID", "RowID"})
        SortField = ""
        '
        Do While TuGio <= DenGio
            Dim col As New GridColumn()
            gridView1.Columns.Add(col)
            col.FieldName = TuGio.ToString("_HHmm")
            col.Caption = TuGio.ToString("HH:mm")
            col.Visible = True
            '
            If col.FieldName = Now.AddHours(1).ToString("_HH00") AndAlso NgayThang.DateTime = Now.Date Then
                col.ColumnEdit = customRepositoryItem1
                col.Width = 150
                SortField = col.FieldName
            End If

            col.AppearanceCell.TextOptions.HAlignment = HorzAlignment.Center
            col.Tag = TuGio
            '
            DT.Columns.Add(col.FieldName, GetType(System.String))
            'Dim R As DataRow = dogDS.Rows(0)
            ''
            'Dim GetTBAssign() As Integer = TBAssignNum(TuGio, _ExIO)
            'R(col.FieldName) = GetTBAssign(0)
            'col.SummaryItem.Tag = GetTBAssign(1)
            '
            If TuGio < DenGio Then
                TuGio = TuGio.AddHours(1)
                If TuGio > DenGio Then
                    TuGio = DenGio
                End If
            Else
                TuGio = TuGio.AddHours(1)
            End If
        Loop
        '
        Dim colTotal As New GridColumn()
        gridView1.Columns.Add(colTotal)
        'colTotal.Fixed = DevExpress.XtraGrid.Columns.FixedStyle.Right
        colTotal.FieldName = "TOTAL"
        colTotal.Caption = "TOTAL"
        colTotal.Visible = True
        colTotal.ColumnEdit = customResTotal
        colTotal.Width = 150
        ''
        DT.Columns.Add("TOTAL", GetType(System.String))
        '

        Dim colNotes As New GridColumn()
        gridView1.Columns.Add(colNotes)
        'colNotes.Fixed = DevExpress.XtraGrid.Columns.FixedStyle.Right
        colNotes.FieldName = "Notes"
        colNotes.Caption = "MESSAGE TO LINE"
        colNotes.Visible = True
        colNotes.Width = 250
        colNotes.AppearanceCell.TextOptions.WordWrap = True
        colNotes.AppearanceCell.Font = New Font("Arial", 10)
        ''
        Dim _Notes As New DataColumn("Notes", GetType(System.String))
        _Notes.DefaultValue = "Chúc các bạn 01 ngày làm việc vui vẻ !"
        DT.Columns.Add(_Notes)
        '
        '
        '
        '
        gridControl1.Dock = DockStyle.None
        gridControl1.Location = New Point(0, GroupBox5.Height)
        gridControl1.Width = Me.Width
        gridControl1.Anchor = AnchorStyles.Left Or AnchorStyles.Right Or AnchorStyles.Top
        gridControl1.SendToBack()
        gridControl1.Height = 30000

        Dim bs As New BindingSource()
        bs.DataSource = DT
        gridControl1.DataSource = bs
        gridControl1.ForceInitialize()
        _helper = New AutoHeightHelper(gridView1)
        _helper.EnableColumnPanelAutoHeight()
        '
        gridView1.EndUpdate()
        '
        '----- loai bo Field KetQua cua DS
        If DS.Columns.Contains("KetQua") Then
            gridControl1.DataSource.DataSource = CountDS(gridControl1.DataSource.DataSource, DS)
        End If
        '
        Dim viewInfo As GridViewInfo = CType(gridView1.GetViewInfo(), GridViewInfo)
        Dim intHeight As Int32 = 0
        For Each GridRow As DevExpress.XtraGrid.Views.Grid.GridRow In viewInfo.RowsLoadInfo.ResultRows
            intHeight += GridRow.TotalHeight
        Next
        '
        viewInfo.Calc(Nothing, viewInfo.Bounds)
        Dim GroupPanel As Rectangle = viewInfo.ViewRects.GroupPanel
        Dim HeaderH As Rectangle = viewInfo.ViewRects.ColumnPanel
        '
        gridControl1.Height = intHeight + HeaderH.Height + GroupPanel.Height + 5
        gridView1.LayoutChanged()
        Application.DoEvents()
        ScrollView.Tag = 0
        '
        ScrollView.Enabled = True
        '
        TrackingDayChanged.Enabled = True
        AddHandler NgayThang.EditValueChanged, AddressOf NgayThang_EditValueChanged
        '
    End Sub
    Private Function CountDS(ByVal DT As DataTable, ByVal DS As DataTable) As DataTable
        Dim TaskList As List(Of String) = DT.AsEnumerable.Select(Function(fuck) fuck.Field(Of String)("TaskID")).ToList
        '---tìm new line ko thuoc DT
        Dim findR As List(Of DataRow) = DS.AsEnumerable.Where(Function(dog) Not TaskList.Contains(dog.Field(Of String)("TaskID"))).ToList
        For Each Rx As DataRow In findR
            Dim nR As DataRow = DT.NewRow
            nR("TaskID") = Rx("TaskID")
            DT.Rows.Add(nR)
        Next
        '
        '----- 60 second swith view total column ----------------------
        Dim IsSwithReview As Boolean = False
        If _SwitchReview Mod 2 = 0 Then
            DirectCast(customResTotal.DrawControl, PPInfo).ScaleFont = 1
        Else
            IsSwithReview = True
            DirectCast(customResTotal.DrawControl, PPInfo).ScaleFont = 3
        End If
        '-----------------------------------------------------------
        '
        Dim Total As Integer = 0
        For i As Integer = 0 To DT.Rows.Count - 1
            Dim sR() As DataRow = DS.Select("TaskID='" & DT.Rows(i)("TaskID") & "'")
            Dim R As DataRow = DT.Rows(i)
            For z As Integer = 0 To sR.Length - 1
                'Dim Data As DataTable = prjData.Deserialize(sR(z)("KetQua"))
                'Dim LastestDone As String = ""
                'For k As Integer = 0 To Data.Columns.Count - 1
                '    Dim Col As String = Data.Columns(k).ColumnName
                '    Dim MonitorCol As String = Microsoft.VisualBasic.Strings.Right(Col, 5)
                '    If Col <> "TOTAL" Then
                '        If PartDateTime(Col) <= Now.AddHours(1) Then
                '            If Data.Rows(1)(Col).ToString <> "" Then
                '                LastestDone = Data.Rows(1)(Col).ToString
                '            End If
                '            R(MonitorCol) = LastestDone & "|" & Data.Rows(0)(Col).ToString
                '        Else
                '            R(MonitorCol) = DBNull.Value
                '        End If
                '    Else
                '        If IsSwithReview AndAlso _TotalMonth IsNot Nothing Then
                '            R(Col) = "0|0"
                '            Dim mR As DataRow = _TotalMonth.Rows.Find(DT.Rows(i)("RowID"))
                '            If mR IsNot Nothing Then
                '                R(Col) = mR("Assign").ToString & "|" & mR("AssignNum")
                '                Total += mR("Assign")
                '            End If
                '        Else
                '            If IsNumeric(Data.Rows(1)(Col).ToString) Then Total += Data.Rows(1)(Col).ToString
                '            R(Col) = Data.Rows(1)(Col).ToString & "|" & Data.Rows(0)(Col).ToString
                '        End If
                '    End If
                'Next
            Next
        Next
        '
        GroupBox5.Tag = Total
        '
        Return DT
        '
    End Function
    Private Function PartDateTime(ByVal FieldName As String) As DateTime
        Return New Date(Microsoft.VisualBasic.Strings.Left(FieldName, 4), Microsoft.VisualBasic.Strings.Mid(FieldName, 5, 2), Microsoft.VisualBasic.Strings.Mid(FieldName, 7, 2), Microsoft.VisualBasic.Strings.Mid(FieldName, 10, 2), 0, 0)
    End Function

    Private Sub gridView1_CustomDrawCell(sender As Object, e As DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs) Handles gridView1.CustomDrawCell
        If e.RowHandle > -1 Then
            '
            ' ''If ContainsComment(e.Column.FieldName, gridView1.GetDataSourceRowIndex(e.RowHandle)) Then
            ' ''    Dim triangle() As Point = {New Point(e.Bounds.Right, e.Bounds.Top), New Point(e.Bounds.Right, e.Bounds.Top + 7), New Point(e.Bounds.Right - 7, e.Bounds.Top)}
            ' ''    e.Graphics.DrawPolygon(New Pen(Color.Green), triangle)
            ' ''    e.Graphics.FillPolygon(New SolidBrush(Color.Green), triangle)
            ' ''End If
            '
            If e.Column.FieldName = "Notes" Then

            ElseIf Not IsDBNull(e.CellValue) Then
                Dim Data() As String = Microsoft.VisualBasic.Strings.Split(e.CellValue.ToString, "|")
                Dim _Done As Integer = 0
                Dim _Plan As Integer = 0
                Dim _Total As Integer = 0
                If Data.Length = 2 Then
                    If IsNumeric(Data(0)) Then _Done = Data(0)
                    If IsNumeric(Data(1)) Then _Plan = Data(1)
                    _Total = _Done - _Plan
                    If _Total > 0 Then
                        e.Appearance.ForeColor = Color.FromArgb(102, 204, 255) ' Color.Blue
                        e.DisplayText = "+" & _Total
                    ElseIf _Total = 0 Then
                        e.Appearance.ForeColor = Color.FromArgb(255, 255, 0) ' yellow
                        e.DisplayText = _Total
                    Else
                        e.Appearance.ForeColor = Color.FromArgb(255, 0, 255) ' Color.Red
                        e.DisplayText = _Total
                    End If
                    Return
                End If
                e.Appearance.ForeColor = Color.FromArgb(255, 255, 0) ' Color.Black
                e.DisplayText = ""
            Else
                If e.Column.ColumnEdit IsNot Nothing Then
                    e.Handled = True
                End If
            End If
        End If
    End Sub

    Private Sub gridView1_CustomDrawRowIndicator(ByVal sender As Object, ByVal e As DevExpress.XtraGrid.Views.Grid.RowIndicatorCustomDrawEventArgs) Handles gridView1.CustomDrawRowIndicator
        Dim rowIndex As Integer = e.RowHandle
        If rowIndex >= 0 Then
            '

            '
            e.Info.DisplayText = gridView1.GetDataRow(rowIndex)("TaskID")
            e.Info.Appearance.Font = New Font(e.Appearance.Font.FontFamily, 20)
            e.Info.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far
            'e.Appearance.FillRectangle(e.Cache, e.Bounds)
            'e.Graphics.DrawString(e.Info.DisplayText, New Font(e.Appearance.Font.FontFamily, 20),
            '   e.Appearance.GetForeBrush(e.Cache), e.Bounds)

            'Dim propertyInfo As Reflection.PropertyInfo = GetType(DevExpress.XtraGrid.Views.Base.BaseView).GetProperty("Painter", BindingFlags.Instance Or BindingFlags.NonPublic)
            'If propertyInfo IsNot Nothing Then
            '    Dim painter As DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter = TryCast(propertyInfo.GetValue(Me.gridView1, Nothing), DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter)
            '    If painter IsNot Nothing Then
            '        Dim ci As New DevExpress.XtraGrid.Drawing.GridFooterCellInfoArgs()
            '        ci.DisplayText = gridView1.GetDataRow(rowIndex)("TaskID")
            '        ci.Bounds = e.Bounds
            '        Dim cache As New DevExpress.Utils.Drawing.GraphicsCache(e.Graphics)
            '        ci.Cache = cache
            '        ci.Appearance.Assign(gridView1.PaintAppearance.FooterPanel)
            '        painter.ElementsPainter.FooterCell.CalcObjectBounds(ci)
            '        Dim caption As String = ci.DisplayText
            '        ci.DisplayText = ""
            '        Dim r As Rectangle = ci.Bounds
            '        r.Inflate(-2, 0)
            '        painter.ElementsPainter.FooterPanel.DrawObject(ci)
            '        painter.ElementsPainter.FooterCell.DrawObject(ci)
            '        ci.Appearance.DrawString(cache, caption, r)
            '        e.Handled = True
            '        cache.Dispose()
            '    End If


            'End If
            'e.Handled = True
        End If

        '
        'e.Info.ImageIndex = -1
    End Sub

    Private Sub GroupBox5_Paint(sender As Object, e As System.Windows.Forms.PaintEventArgs) Handles GroupBox5.Paint
        Dim propertyInfo As PropertyInfo = GetType(DevExpress.XtraGrid.Views.Base.BaseView).GetProperty("Painter", BindingFlags.Instance Or BindingFlags.NonPublic)
        If propertyInfo IsNot Nothing Then
            Dim painter As DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter = TryCast(propertyInfo.GetValue(Me.gridView1, Nothing), DevExpress.XtraGrid.Views.Grid.Drawing.GridPainter)
            If painter IsNot Nothing Then
                Dim vi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridViewInfo = TryCast(Me.gridView1.GetViewInfo(), DevExpress.XtraGrid.Views.Grid.ViewInfo.GridViewInfo)
                '
                Dim IsClockPos As Boolean = False
                Dim yOffset As Integer = 31
                For Each column As GridColumn In Me.gridView1.Columns
                    If vi.ColumnsInfo(column) IsNot Nothing Then
                        Dim columnBounds As Rectangle = vi.ColumnsInfo(column).Bounds
                        If CDate(column.Tag).ToString("yyyyMMdd_HH00") = Now.AddHours(1).ToString("yyyyMMdd_HH00") Then
                            DigitalDisplayControl1.Location = New Point(columnBounds.X, 0)
                            DigitalDisplayControl1.Width = columnBounds.Width - 2
                            DigitalDisplayControl1.Tag = "1"
                            IsClockPos = True
                        Else
                            '
                            Dim cache As New DevExpress.Utils.Drawing.GraphicsCache(e.Graphics)
                            Dim ci As New DevExpress.XtraGrid.Drawing.GridFooterCellInfoArgs()
                            ci.Appearance.Assign(gridView1.PaintAppearance.HeaderPanel)
                            '
                            Dim Caption As String = column.Caption
                            If column.FieldName = "TOTAL" Then
                                Caption = GroupBox5.Tag
                                columnBounds.Height += yOffset
                                ci.Appearance.Font = New Font("Arial", 29, FontStyle.Bold)
                            Else
                                columnBounds.Y += yOffset
                            End If
                            '
                            ci.Bounds = columnBounds
                            ci.Cache = cache
                            painter.ElementsPainter.FooterCell.CalcObjectBounds(ci)
                            ci.DisplayText = Caption
                            '
                            'ci.DisplayText = ""
                            Dim r As Rectangle = ci.Bounds
                            r.Inflate(-2, 0)
                            painter.ElementsPainter.FooterPanel.DrawObject(ci)
                            painter.ElementsPainter.FooterCell.DrawObject(ci)

                            ci.Appearance.DrawString(cache, Caption, r)

                            cache.Dispose()
                        End If

                    End If
                Next
                '
                If Not IsClockPos Then
                    DigitalDisplayControl1.Location = New Point(Me.Width - DigitalDisplayControl1.Width - 2, 0)
                    DigitalDisplayControl1.Anchor = AnchorStyles.Top Or AnchorStyles.Right
                    DigitalDisplayControl1.Tag = "0"
                End If
                '
                Update_CrossHair()
                '
            End If
        End If
        e.Graphics.DrawLine(Pens.Black, New Point(0, GroupBox5.Height - 1), New Point(GroupBox5.Width, GroupBox5.Height - 1))
    End Sub

    Private Sub REAL_DATA()
        '
        Try
            Dim DS As DataTable = LOAD_KETQUA(1)
            If DS.Columns.Contains("KetQua") Then
                gridControl1.DataSource.DataSource = CountDS(gridControl1.DataSource.DataSource, DS)
                gridView1.LayoutChanged()
            End If
            '
            If CDate(CrossHairTimer.Tag).ToString("yyyyMMdd_HH00") <> Now.ToString("yyyyMMdd_HH00") Then
                Dim CurCol As GridColumn = gridView1.Columns(Now.ToString("_HH00"))
                If CurCol IsNot Nothing Then
                    CurCol.ColumnEdit = Nothing : CurCol.Width = 75
                    CurCol = gridView1.Columns(Now.AddHours(1).ToString("_HH00"))
                    CurCol.ColumnEdit = customRepositoryItem1 : CurCol.Width = 150
                End If
            End If
            '
            GroupBox5.Refresh()
            '
        Catch ex As Exception

        End Try
    End Sub

    Private Sub gridView1_LeftCoordChanged(sender As Object, e As System.EventArgs) Handles gridView1.LeftCoordChanged
        GroupBox5.Refresh()
    End Sub

    Private Sub gridView1_MouseDown(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles gridView1.MouseDown
        If Not _IsTVMode Then
            If e.Button = Windows.Forms.MouseButtons.Right Then
                Dim hi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridHitInfo = gridView1.CalcHitInfo(New Point(e.X, e.Y))
                Dim OnRowCell As Boolean = ShowHitInfo(hi)
                If OnRowCell AndAlso gridView1.GetFocusedDataSourceRowIndex() > -1 AndAlso hi.Column IsNot Nothing Then
                    Dim coordinates As New CommentCoordinates(gridView1.GetFocusedDataSourceRowIndex(), hi.Column.FieldName)
                    comments(coordinates) = "HieuTest"
                End If
                PopupMenu2.ShowPopup(Control.MousePosition)
            End If
        End If
    End Sub
    Private Function ShowHitInfo(ByVal hi As DevExpress.XtraGrid.Views.Grid.ViewInfo.GridHitInfo) As Boolean
        If hi.InRow Or hi.InRowCell Then Return True
    End Function

#End Region

#Region "TEST ONLY"

    'Private Sub Form1_MouseMoveDrawing(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles Me.MouseMove

    '    Dim g As Graphics = Me.CreateGraphics()
    '    g.Clear(Nothing)
    '    graph_sizes()
    '    g.DrawLine(Pens.Blue, x1, e.Y, x2, e.Y)  'draw horizontal line

    '    g.DrawLine(Pens.Red, e.X, y1, e.X, y2)   'draw vertical line

    '    'Draw_cross_hair_lines(g)
    'End Sub
    'Dim cursor_x, cursor_y As Decimal
    'Dim x1, y1, x2, y2 As Decimal
    'Dim std_width, std_height, std_x, std_y, old_x, old_y As Decimal
    'Dim balls As Integer

    'Private Sub graph_sizes()

    '    std_width = Me.ClientSize.Width * 0.9       'width of the main rectangle

    '    std_height = Me.ClientSize.Height * 0.9     'height of the main rectangle

    '    std_x = Me.ClientSize.Width * 0.01          'x cord of the main rectangle

    '    std_y = Me.ClientSize.Height * 0.01         'y cord of the main rectangle

    '    x1 = std_x

    '    x2 = std_x + std_width

    '    y1 = std_y

    '    y2 = std_y + std_height

    'End Sub
    'Private Sub Draw_cross_hair_lines(ByVal g As Graphics)
    '    'draw the rectangle
    '    g.DrawRectangle(Pens.Black, std_x, std_y, std_width, std_height)
    'End Sub

#End Region

    Private Sub ViewProductionStatus_ItemClick(sender As Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles ViewProductionStatus.ItemClick
        Dim _TVFrm As DevExpress.XtraEditors.XtraForm = Nothing
        _TVFrm = BuildTVFrm()
        _TVFrm.Show()
        '_TVFrm.WindowState = FormWindowState.Maximized
        _TVFrm.Size = New Size(1920, 900)
        _TVFrm.Location = New Point(0, 0)
    End Sub

    Private _src As _ProductionPlaning_Dialy1
    Private Sub displayTV_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles displayTV.ItemClick
        Dim _TVFrm As DevExpress.XtraEditors.XtraForm = Nothing
        Dim SearchRst As Integer = DetectIfMonitorsExtendedMode() ' DisplayChanger.Start()
        If SearchRst > 1 Then
            Dim RstExtendTV As Long = New TVmonitor().ExtendDisplays()
            Do While SearchRst > Screen.AllScreens.Length
                System.Threading.Thread.Sleep(500)
                Application.DoEvents()
            Loop

            If SearchRst > 1 Then
                _TVFrm = BuildTVFrm()
                _TVFrm.Show()
                TVmonitor.ExtendMonitor(_TVFrm.Handle, 0)
                _TVFrm.WindowState = FormWindowState.Maximized
            End If
        End If
        '
    End Sub
    Private Function BuildTVFrm() As DevExpress.XtraEditors.XtraForm
        _src = New _ProductionPlaning_Dialy1
        _src.IsTVMode = True
        _src.WS = Me
        _src.Dock = DockStyle.Fill
        '
        Dim _TVFrm As New DevExpress.XtraEditors.XtraForm
        _TVFrm.AutoScaleMode = System.Windows.Forms.AutoScaleMode.None
        _TVFrm.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D
        _TVFrm.ControlBox = False
        _TVFrm.Name = "TVProduction"
        _TVFrm.ShowIcon = False
        _TVFrm.ShowInTaskbar = False
        _TVFrm.Controls.Add(_src)
        '
        extendTV.Visible = True
        displayTV.Enabled = False
        ViewProductionStatus.Enabled = False
        '
        Return _TVFrm
    End Function
    Private Function DetectIfMonitorsExtendedMode() As Integer
        Dim result As Boolean = False
        Dim search As New ManagementObjectSearcher("root\CIMV2", "SELECT * FROM Win32_PnPEntity WHERE SERVICE = 'monitor'")
        Return search.Get().Count
    End Function
    Private Sub extendTV_Click(sender As System.Object, e As System.EventArgs) Handles extendTV.Click
        If _src IsNot Nothing AndAlso Not _src.IsDisposed Then
            _src.FindForm.Close()
        End If
        '
        _src = Nothing
        extendTV.Visible = False
        displayTV.Enabled = True
        ViewProductionStatus.Enabled = True
        '
        Call New TVmonitor().ExternalDisplay()
        '
    End Sub

#Region "COMMENT"
    Private Sub btnMessageToLine_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles btnMessageToLine.ItemClick
        Dim Msg As New _ProductionPlaning_Dialy
        Msg.Show(Me.FindForm)
    End Sub

    Private comments As New Dictionary(Of CommentCoordinates, String)
    Private Function ContainsComment(ByVal columnName As String, ByVal rowIndex As Integer) As Boolean
        Return comments.ContainsKey(New CommentCoordinates(rowIndex, columnName))
    End Function
    Private Function GetComment(ByVal columnName As String, ByVal rowIndex As Integer) As String
        Dim coordinates As New CommentCoordinates(rowIndex, columnName)
        If comments.ContainsKey(coordinates) Then
            Return comments(coordinates)
        Else
            Return String.Empty
        End If
    End Function

    Private Sub toolTipController1_GetActiveObjectInfo(ByVal sender As Object, ByVal e As DevExpress.Utils.ToolTipControllerGetActiveObjectInfoEventArgs) Handles toolTipController1.GetActiveObjectInfo
        If e.Info IsNot Nothing Then
            Return
        End If
        Dim columnName As String = String.Empty
        Dim dataSourceRowIndex As Integer = -1, rowHandle As Integer = -1
        If e.SelectedControl Is gridControl1 Then
            Dim info As GridHitInfo = gridView1.CalcHitInfo(e.ControlMousePosition)
            If info.InRowCell Then
                columnName = info.Column.Name
                dataSourceRowIndex = gridView1.GetDataSourceRowIndex(info.RowHandle)
                rowHandle = info.RowHandle
            End If
        ElseIf TypeOf e.SelectedControl Is BaseEdit AndAlso gridView1.ActiveEditor.Equals(e.SelectedControl) Then
            columnName = gridView1.FocusedColumn.Name
            dataSourceRowIndex = gridView1.GetFocusedDataSourceRowIndex()
            rowHandle = gridView1.FocusedRowHandle
        End If
        If columnName <> String.Empty Then
            Dim text As String = GetComment(columnName, dataSourceRowIndex)
            Dim cellKey As String = String.Format("{0}-{1}", rowHandle, columnName)
            e.Info = New DevExpress.Utils.ToolTipControlInfo(cellKey, text)
        End If
    End Sub
    Public Structure CommentCoordinates
        Public Sub New(ByVal rowIndex As Integer, ByVal columnName As String)
            Me.RowIndex = rowIndex
            Me.ColumnName = columnName
        End Sub
        Public RowIndex As Integer
        Public ColumnName As String
    End Structure
#End Region

    Private Sub RefreshView_ItemClick(sender As System.Object, e As DevExpress.XtraBars.ItemClickEventArgs) Handles RefreshView.ItemClick
        Dim str As String = "Select TaskID,Sum(SumPlanning) As AssignNum,Sum(SumDone) As Assign From sum_donesx Where EachDate='" & Now.ToString("yyyy/MM/01") & "' Group By TaskID"
        _TotalMonth = FrameWork.dbObj.GetDT(str)
        _TotalMonth.PrimaryKey = New DataColumn() {_TotalMonth.Columns("TaskID")}
    End Sub
End Class


Public Class ZigzagControl
    Inherits Control
    Private _points As Point()
    Private _leftpoints As PointF()
    Private _rightpoints As PointF()
    Private _boundpoints As PointF()
    Private _thickness As Integer
    Private _pointnum As Integer
    Public Sub New(points As Point(), Optional thickness As Integer = 1)
        dog_Resize(points, thickness)
        LineColor = Color.Black

    End Sub
    Public Sub dog_Resize(points As Point(), Optional thickness As Integer = Nothing)
        _points = points
        If thickness <> Nothing Then _thickness = thickness
        _pointnum = _points.Length
        _leftpoints = New PointF(_pointnum - 1) {}
        _rightpoints = New PointF(_pointnum - 1) {}
        CalcBoundPoints()
        CalcControlSizeAndLocation()
    End Sub

    Private Sub CalcFirstPointPair()
        Dim u0 As Single, v0 As Single, p0 As Single, q0 As Single
        Dim x0 As Double, y0 As Double, x1 As Double, y1 As Double
        Dim dx As Double, dy As Double, l As Double
        Dim w As Double = _thickness
        x0 = _points(0).X
        y0 = _points(0).Y
        x1 = _points(1).X
        y1 = _points(1).Y

        dx = x1 - x0
        dy = y1 - y0
        l = Math.Sqrt(dx * dx + dy * dy)

        u0 = CSng(x0 + w * dy / l)
        v0 = CSng(y0 - w * dx / l)
        _leftpoints(0) = New PointF(u0, v0)

        p0 = CSng(x0 - w * dy / l)
        q0 = CSng(y0 + w * dx / l)
        _rightpoints(0) = New PointF(p0, q0)

    End Sub
    Private Sub CalcMidlePointPair(pairIndex As Integer)
        Dim u As Single, v As Single, p As Single, q As Single
        Dim u1 As Double, v1 As Double, u2 As Double, v2 As Double
        Dim p1 As Double, q1 As Double, p2 As Double, q2 As Double
        Dim x1 As Double, y1 As Double, x2 As Double, y2 As Double, x3 As Double, y3 As Double
        Dim dx As Double, dy As Double, l As Double
        Dim a11 As Double, a12 As Double, b1 As Double
        Dim a21 As Double, a22 As Double, b2 As Double
        Dim det As Double, det1 As Double, det2 As Double
        Dim w As Double = _thickness

        x1 = _points(pairIndex - 1).X
        y1 = _points(pairIndex - 1).Y
        x2 = _points(pairIndex).X
        y2 = _points(pairIndex).Y
        x3 = _points(pairIndex + 1).X
        y3 = _points(pairIndex + 1).Y

        dx = x2 - x1
        dy = y2 - y1
        l = Math.Sqrt(dx * dx + dy * dy)
        u1 = x1 + w * dy / l
        v1 = y1 - w * dx / l

        a11 = y2 - y1
        a12 = -(x2 - x1)
        b1 = (y2 - y1) * u1 - (x2 - x1) * v1

        dx = x3 - x2
        dy = y3 - y2
        l = Math.Sqrt(dx * dx + dy * dy)
        u2 = x2 + w * dy / l
        v2 = y2 - w * dx / l

        a21 = y3 - y2
        a22 = -(x3 - x2)
        b2 = (y3 - y2) * u2 - (x3 - x2) * v2

        det = a11 * a22 - a21 * a12
        det1 = b1 * a22 - b2 * a12
        det2 = a11 * b2 - a21 * b1
        u = CSng(det1 / det)
        v = CSng(det2 / det)
        _leftpoints(pairIndex) = New PointF(u, v)

        dx = x2 - x1
        dy = y2 - y1
        l = Math.Sqrt(dx * dx + dy * dy)
        p1 = x1 - w * dy / l
        q1 = y1 + w * dx / l

        a11 = y2 - y1
        a12 = -(x2 - x1)
        b1 = (y2 - y1) * p1 - (x2 - x1) * q1

        dx = x3 - x2
        dy = y3 - y2
        l = Math.Sqrt(dx * dx + dy * dy)
        p2 = x2 - w * dy / l
        q2 = y2 + w * dx / l

        a21 = y3 - y2
        a22 = -(x3 - x2)
        b2 = (y3 - y2) * p2 - (x3 - x2) * q2

        det = a11 * a22 - a21 * a12
        det1 = b1 * a22 - b2 * a12
        det2 = a11 * b2 - a21 * b1
        p = CSng(det1 / det)
        q = CSng(det2 / det)
        _rightpoints(pairIndex) = New PointF(p, q)

    End Sub
    Private Sub CalcLastPointPair()
        Dim un As Single, vn As Single, pn As Single, qn As Single
        Dim xn As Double, yn As Double, xn_1 As Double, yn_1 As Double
        Dim dx As Double, dy As Double, l As Double
        Dim w As Double = _thickness
        Dim n As Integer = _pointnum - 1
        xn = _points(n).X
        yn = _points(n).Y
        xn_1 = _points(n - 1).X
        yn_1 = _points(n - 1).Y

        dx = xn_1 - xn
        dy = yn_1 - yn
        l = Math.Sqrt(dx * dx + dy * dy)

        pn = CSng(xn + w * dy / l)
        qn = CSng(yn - w * dx / l)
        _rightpoints(n) = New PointF(pn, qn)

        un = CSng(xn - w * dy / l)
        vn = CSng(yn + w * dx / l)
        _leftpoints(n) = New PointF(un, vn)
    End Sub
    Private Sub CalcBoundPoints()
        Dim i As Integer

        CalcFirstPointPair()
        For i = 1 To _pointnum - 2
            CalcMidlePointPair(i)
        Next
        CalcLastPointPair()

        Dim j As Integer = 0
        Dim n As Integer = 2 * _pointnum + 1
        _boundpoints = New PointF(n - 1) {}
        For i = 0 To _pointnum - 1
            _boundpoints(j) = _leftpoints(i)
            j += 1
        Next
        For i = _pointnum - 1 To 0 Step -1
            _boundpoints(j) = _rightpoints(i)
            j += 1
        Next

        _boundpoints(n - 1) = _leftpoints(0)
    End Sub
    Private Sub CalcControlSizeAndLocation()
        Dim minX As Single, minY As Single, maxX As Single, maxY As Single
        minX = InlineAssignHelper(maxX, _leftpoints(0).X)
        minY = InlineAssignHelper(maxY, _leftpoints(0).Y)
        Dim n As Integer = _boundpoints.Length
        For i As Integer = 0 To n - 1
            If _boundpoints(i).X < minX Then
                minX = _boundpoints(i).X
            End If
            If _boundpoints(i).X > maxX Then
                maxX = _boundpoints(i).X
            End If
            If _boundpoints(i).Y < minY Then
                minY = _boundpoints(i).Y
            End If
            If _boundpoints(i).Y > maxY Then
                maxY = _boundpoints(i).Y
            End If
        Next

        Dim width As Integer = _thickness 'CInt(Math.Ceiling(maxX - minX))
        Dim height As Integer = CInt(Math.Ceiling(maxY - minY))

        Me.Size = New Size(width, height)
        Me.Location = New Point(CInt(minX), CInt(minY))

        For i As Integer = 0 To n - 1
            _boundpoints(i).X -= minX
            _boundpoints(i).Y -= minY
        Next
    End Sub
    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        Dim graphicsPath As New Drawing2D.GraphicsPath()
        graphicsPath.AddLines(_boundpoints)
        Me.Region = New Region(graphicsPath)
    End Sub
    Public Property LineColor() As Color
        Get
            Return BackColor
        End Get
        Set(value As Color)
            If value = BackColor Then
                Return
            End If
            BackColor = value
        End Set
    End Property
    Public Property Thickness() As Integer
        Get
            Return _thickness
        End Get
        Set(value As Integer)
            If value = _thickness Then
                Return
            End If
            _thickness = value
            CalcBoundPoints()
            CalcControlSizeAndLocation()
            Invalidate()
        End Set
    End Property
    Private Shared Function InlineAssignHelper(Of T)(ByRef target As T, value As T) As T
        target = value
        Return value
    End Function
End Class

