import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';

import { ActivatedRoute } from '@angular/router';
import { BoardService } from '@services/board.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { CardsService } from '@services/cards.service';
import { List } from '@models/list.model';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit {
  board: Board | null = null;
  inputCard = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  constructor(
    private dialog: Dialog,
    private route: ActivatedRoute,
    private boardService: BoardService,
    private cardsService: CardsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.getBoard(id);
      }
    });
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    //after
    const position = this.boardService.getPosition(
      event.container.data,
      event.currentIndex
    );
    const card = event.container.data[event.currentIndex];
    const listId = event.container.id;
    this.updateCard(card, position, listId);
  }

  addColumn() {
    // this.columns.push({
    //   title: 'New Column',
    //   todos: [],
    // });
  }

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
      },
    });
    dialogRef.closed.subscribe((output) => {
      console.log(output);
    });
  }

  private getBoard(id: string) {
    this.boardService.getBoard(id).subscribe((board) => {
      this.board = board;
    });
  }

  private updateCard(card: Card, position: number, listId: string | number) {
    this.cardsService
      .update(card.id, { position, listId })
      .subscribe((cardUpdated) => {
        console.log(cardUpdated);
      });
  }

  openFormCard(list: List) {
    // list.showCardForm = !list.showCardForm;
    // list: false => todos
    //list click : true
    if (this.board?.lists) {
      this.board.lists = this.board.lists.map((iteratorList) => {
        if (iteratorList.id == list.id) {
          return {
            ...iteratorList,
            showCardForm: true,
          };
        }
        return {
          ...iteratorList,
          showCardForm: false,
        };
      });
    }
  }

  createCard(list: List) {
    const title = this.inputCard.value;
    if (this.board) {
      this.cardsService
        .create({
          title,
          listId: list.id,
          boardId: this.board.id,
          position: this.boardService.getPositionNewCard(list.cards),
        })
        .subscribe((card) => {
          list.cards.push(card);
          this.inputCard.setValue('');
          list.showCardForm = false;
        });
    }
  }

  closeCardForm(list: List) {
    list.showCardForm = false;
  }
}
